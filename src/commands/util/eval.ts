import {
	ComponentType,
	type APIButtonComponentWithCustomId,
	type APIEmbed
} from "discord-api-types/v9";
import Discord, {
	ApplicationCommandOptionType,
	ButtonStyle,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction,
	type Message
} from "discord.js";
import ms from "ms";
import { performance } from "perf_hooks";
import { COLORS, defaultEmbed, REGEXP } from "../../constants/index.js";
import { e } from "../../emojis/index.js";
import type Logger from "../../loggers/index.js";
import ButtonManager from "../../modules/ButtonManager.js";
import {
	type Command,
	type CommandOptions,
	type EvalOutput
} from "../../typings/index.js";
import { codeblock, indent } from "../../utils/index.js";

const options: Partial<CommandOptions> = {
	private: true
};

const data: ChatInputApplicationCommandData = {
	name: "eval",
	description: "Runs code",
	options: [
		{
			name: "code",
			description: "The code to run",
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: "reply",
			description: "Reply to the command. Default is true",
			type: ApplicationCommandOptionType.Boolean
		}
	]
};

async function execute(
	intr: ChatInputCommandInteraction<"cached">,
	logger: Logger
) {
	const code = intr.options.getString("code", true);
	const reply = intr.options.getBoolean("reply") ?? true;

	const stringify = (value: unknown): string => {
		const replacer = (_: string, val: unknown) => {
			if (typeof val === "function" || val == null) {
				return `${value}`;
			}

			if (typeof val === "bigint") {
				return `${val}n`;
			}

			return val;
		};

		const string =
			JSON.stringify(value, replacer, 2) ??
			"Something went wrong with stringifying the content";

		return string.replace('"void"', "void");
	};

	const parse = (
		string: string,
		prefix: string,
		embedStyle?: string | null
	) => {
		if (!string.length) {
			return null;
		}

		return codeblock(string, {
			prefix,
			lang: embedStyle === undefined ? "js" : null
		});
	};

	const evaluate = async () => {
		const client = intr.client;

		// Prevents "ReferenceError: x is not defined"
		client;
		Discord;

		try {
			const start = performance.now();
			const result = await eval(`(async () => {\n${code}\n})()`);
			const end = performance.now();

			const type = typeof result;

			const constructor =
				result === null
					? "Null"
					: result === undefined
					? "Undefined"
					: (result.constructor.name as string);

			const time = Number((end - start).toFixed(3));
			const timeTaken = ms(time, { long: true }).replace(".", ",");

			const stringedOutput = stringify(result).replaceAll(
				new RegExp(REGEXP.TOKEN, "g"),
				"[REDACTED]"
			);

			const parsedInput = parse(code, "**Input**");
			const parsedOutput = parse(stringedOutput, "**Output**");

			const successInputEmbed: APIEmbed = {
				...defaultEmbed(intr),
				description: parsedInput ?? "No input"
			};

			const successOutputEmbed: APIEmbed = {
				...defaultEmbed(intr),
				description: parsedOutput ?? "No output",
				footer: { text: `${timeTaken} • ${type} (${constructor})` }
			};

			const output: EvalOutput = {
				embeds: [successInputEmbed, successOutputEmbed],
				output: stringedOutput,
				type: "output"
			};

			return output;
		} catch (err: unknown) {
			const error = err as Error;
			const msg = error.stack ?? error.toString();

			const parsedInput = parse(code, " **Input**");
			const parsedError = parse(msg, " **Error**", null);

			const errorInputEmbed: APIEmbed = {
				...defaultEmbed(intr),
				color: COLORS.red,
				description: parsedInput ?? "No input"
			};

			const errorOutputEmbed: APIEmbed = {
				...defaultEmbed(intr),
				color: COLORS.red,
				description: parsedError ?? "No error",
				footer: { text: "Evaluation failed" }
			};

			const output: EvalOutput = {
				embeds: [errorInputEmbed, errorOutputEmbed],
				output: msg,
				type: "error"
			};

			return output;
		}
	};

	const { embeds, output, type } = await evaluate();

	if (reply) {
		const buttonManager = new ButtonManager();

		const outputButton: APIButtonComponentWithCustomId = {
			label: `Full ${type}`,
			custom_id: "output",
			style: ButtonStyle.Secondary,
			emoji: { name: "📤" },
			type: ComponentType.Button
		};

		const codeButton: APIButtonComponentWithCustomId = {
			label: "Full input",
			custom_id: "code",
			style: ButtonStyle.Secondary,
			emoji: { name: "📥" },
			type: ComponentType.Button
		};

		buttonManager.setRows([outputButton, codeButton]);

		const msg = (await intr.editReply({
			embeds,
			components: buttonManager.rows
		})) as Message<true>;

		const collector = buttonManager.setMessage(msg).createCollector();

		collector.on("collect", async (interaction) => {
			if (interaction.user.id !== intr.user.id) {
				interaction.reply({
					content: e`{cross} This button is not for you`,
					ephemeral: true
				});

				return;
			}

			await interaction.deferUpdate();

			if (interaction.customId === "output") {
				const attachment = {
					attachment: Buffer.from(output),
					name: `${type}.txt`
				};

				buttonManager.disable("output");

				await interaction.editReply({ components: buttonManager.rows });

				await interaction.followUp({ files: [attachment] });

				logger.logInteraction(
					"Sent output as an attachment:",
					...indent(output, { width: 4 }).split("\n")
				);
			} else if (interaction.customId === "code") {
				const attachment = {
					attachment: Buffer.from(code),
					name: "code.txt"
				};

				buttonManager.disable("code");

				await interaction.editReply({ components: buttonManager.rows });

				await interaction.followUp({ files: [attachment] });

				logger.logInteraction(
					"Sent code as an attachment:",
					...indent(code, { width: 4 }).split("\n")
				);
			}
		});

		collector.on("end", () => {
			buttonManager.disable("output", "code");

			intr.editReply({ components: buttonManager.rows }).catch(
				() => null
			);
		});
	}

	logger.logInteraction(
		"Code:",
		...indent(code, { width: 4 }).split("\n"),
		"Output:",
		...indent(output, { width: 4 }).split("\n")
	);
}

export const getCommand = () =>
	({
		options,
		data,
		execute
	} as Partial<Command>);
