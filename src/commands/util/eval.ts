import Discord, {
	MessageAttachment,
	MessageButton,
	type ChatInputApplicationCommandData,
	type CommandInteraction
} from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import ms from "ms";
import { performance } from "perf_hooks";
import { newDefaultEmbed, REGEXP } from "../../constants/index.js";
import { ButtonManager } from "../../modules/index.js";
import { type Command, type CommandOptions, type EvalOutput } from "../../typings/index.js";
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
			type: ApplicationCommandOptionTypes.STRING,
			required: true
		},
		{
			name: "reply",
			description: "Reply to the command. Default is true",
			type: ApplicationCommandOptionTypes.BOOLEAN
		}
	]
};

async function execute(intr: CommandInteraction<"cached">) {
	const code = intr.options.getString("code", true);
	const reply = intr.options.getBoolean("reply") ?? true;

	const stringify = (value: unknown): string => {
		const replacer = (_: string, val: unknown) => {
			if (typeof val === "function" || val == null) return `${value}`;

			if (typeof val === "bigint") return `${val}n`;

			return val;
		};

		const string = JSON.stringify(value, replacer, 2) ?? "Something went wrong with stringifying the content";

		return string.replace('"void"', "void");
	};

	const parse = (string: string, prefix: string, embedStyle?: string | null) => {
		if (!string.length) return null;

		return Util.mergeForCodeblock(string, { prefix, lang: embedStyle === undefined ? "js" : null });
	};

	const evaluate = async () => {
		const client = intr.client;

		Discord; // "ReferenceError: Discord is not defined" if not here

		try {
			const start = performance.now();
			const result = await eval(`(async () => {\n${code}\n})()`);
			const end = performance.now();
			const type = typeof result;
			const constructor = result != null ? (result.constructor.name as string) : "Nullish";
			const time = Number((end - start).toFixed(3));
			const timeTaken = ms(time, { long: true }).replace(".", ",");
			const stringedOutput = stringify(result).replaceAll(new RegExp(REGEXP.TOKEN, "g"), "[REDACTED]");
			const parsedInput = parse(code, "**Input**");
			const parsedOutput = parse(stringedOutput, "**Output**");			const successInputEmbed = newDefaultEmbed(intr).setDescription(parsedInput ?? "No input");

			const successOutputEmbed = newDefaultEmbed(intr)
				.setDescription(parsedOutput ?? "No output")
				.setFooter(`${timeTaken} • ${type} (${constructor})`);

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

			const errorInputEmbed = newDefaultEmbed(intr)
				.setColor(client.colors.red)
				.setDescription(parsedInput ?? "No input");

			const errorOutputEmbed = newDefaultEmbed(intr)
				.setColor(client.colors.red)
				.setDescription(parsedError ?? "No error")
				.setFooter("Evaluation failed");

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

		const outputButton = new MessageButton() //
			.setLabel(`Full ${type}`)
			.setCustomId("output")
			.setStyle("SECONDARY")
			.setEmoji("📤");

		const codeButton = new MessageButton() //
			.setLabel("Full input")
			.setCustomId("code")
			.setStyle("SECONDARY")
			.setEmoji("📥");

		buttonManager.setRows(outputButton, codeButton);

		const msg = await intr.editReply({ embeds, components: buttonManager.rows });
		const collector = buttonManager.setMessage(msg).createCollector();

		collector.on("collect", async (interaction) => {
			if (interaction.user.id !== intr.user.id) {
				interaction.reply({
					content: `${intr.client.maserEmojis.thumbsDown} This button is not for you`,
					ephemeral: true
				});

				return;
			}

			await interaction.deferUpdate();

			if (interaction.customId === "output") {
				const attachment = new MessageAttachment(Buffer.from(output), `${type}.txt`);

				buttonManager.disable("output");

				await interaction.editReply({ components: buttonManager.rows });

				await interaction.followUp({ files: [attachment] });

				intr.logger.log(`Sent output as an attachment:\n${Util.indent(output)}`);
			}
			//
			else if (interaction.customId === "code") {
				const attachment = new MessageAttachment(Buffer.from(code), "code.txt");

				buttonManager.disable("code");

				await interaction.editReply({ components: buttonManager.rows });

				await interaction.followUp({ files: [attachment] });

				intr.logger.log(`Sent code as an attachment:\n${Util.indent(code)}`);
			}
		});

		collector.on("end", () => {
			buttonManager.disable("output", "code");

			intr.editReply({ components: buttonManager.rows }).catch(() => null);
		});
	}

	intr.logger.log(`Code:\n${Util.indent(code, 4)}`, `Output:\n${Util.indent(output, 4)}`);
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
