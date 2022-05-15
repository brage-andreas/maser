import {
	ComponentType,
	type APIButtonComponentWithCustomId,
	type APIEmbed
} from "discord-api-types/v9";
import Discord, {
	ApplicationCommandOptionType,
	Attachment,
	ButtonStyle,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import ms from "ms";
import { performance } from "perf_hooks";
import { defaultEmbed, REGEXP } from "../../constants/index.js";
import { ButtonManager } from "../../modules/index.js";
import {
	type Command,
	type CommandOptions,
	type EvalOutput
} from "../../typings/index.js";
import Util from "../../utils/index.js";

const options: Partial<CommandOptions> = {
	logLevel: 2,
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

async function execute(intr: ChatInputCommandInteraction<"cached">) {
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

		return Util.mergeForCodeblock(string, {
			prefix,
			lang: embedStyle === undefined ? "js" : null
		});
	};

	const evaluate = async () => {
		const client = intr.client;

		Discord; // "ReferenceError: Discord is not defined" if not here

		try {
			const start = performance.now();
			const result = await eval(`(async () => {\n${code}\n})()`);
			const end = performance.now();
			//
			const type = typeof result;

			const constructor =
				result != null
					? (result.constructor.name as string)
					: "Nullish";

			//
			const time = Number((end - start).toFixed(3));
			const timeTaken = ms(time, { long: true }).replace(".", ",");

			//
			const stringedOutput = stringify(result).replaceAll(
				new RegExp(REGEXP.TOKEN, "g"),
				"[REDACTED]"
			);

			//
			const parsedInput = parse(code, "**Input**");
			const parsedOutput = parse(stringedOutput, "**Output**");

			//
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
				color: client.colors.red,
				description: parsedInput ?? "No input"
			};

			const errorOutputEmbed: APIEmbed = {
				...defaultEmbed(intr),
				color: client.colors.red,
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

	const {
 embeds, output, type 
} = await evaluate();

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

		const msg = await intr.editReply({
			embeds,
			components: buttonManager.rows
		});

		const collector = buttonManager.setMessage(msg).createCollector();

		collector.on("collect", async (interaction) => {
			if (interaction.user.id !== intr.user.id) {
				interaction.reply({
					content: `${intr.client.maserEmojis.cross} This button is not for you`,
					ephemeral: true
				});

				return;
			}

			await interaction.deferUpdate();

			if (interaction.customId === "output") {
				const attachment = new Attachment(
					Buffer.from(output),
					`${type}.txt`
				);

				buttonManager.disable("output");

				await interaction.editReply({ components: buttonManager.rows });

				await interaction.followUp({ files: [attachment] });

				intr.logger.log(
					`Sent output as an attachment:\n${Util.indent(output)}`
				);
			}
			//
			else if (interaction.customId === "code") {
				const attachment = new Attachment(
					Buffer.from(code),
					"code.txt"
				);

				buttonManager.disable("code");

				await interaction.editReply({ components: buttonManager.rows });

				await interaction.followUp({ files: [attachment] });

				intr.logger.log(
					`Sent code as an attachment:\n${Util.indent(code)}`
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

	intr.logger.log(
		`Code:\n${Util.indent(code, 4)}`,
		`Output:\n${Util.indent(output, 4)}`
	);
}

export const getCommand = () =>
	({
		options,
		data,
		execute
	} as Partial<Command>);
