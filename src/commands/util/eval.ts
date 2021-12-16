import Discord, {
	MessageAttachment,
	MessageButton,
	MessageEmbed,
	type ChatInputApplicationCommandData,
	type CommandInteraction,
	type Message
} from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import ms from "ms";
import { performance } from "perf_hooks";
import { defaultEmbedOptions, REGEXP } from "../../constants.js";
import { ButtonManager } from "../../modules/index.js";
import { CommandOptions, type Command, type EvalOutput } from "../../typings/index.js";
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

	const { emError, emSuccess, emInput } = intr.client.systemEmojis;

	const stringify = (value: any): string => {
		const replacer = (_: string, val: any) => {
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

		const { emError, emSuccess, emInput } = client.systemEmojis;

		try {
			const start = performance.now();
			const result = await eval(`(async () => {\n${code}\n})()`);
			const end = performance.now();

			const type = typeof result;
			const constructor = result != null ? (result.constructor.name as string) : "Nullish";

			const time = Number((end - start).toFixed(3));
			const timeTaken = ms(time, { long: true }).replace(".", ",");

			const stringedOutput = stringify(result).replaceAll(new RegExp(REGEXP.TOKEN, "g"), "[REDACTED]");

			const parsedInput = parse(code, `${emInput} **Input**`);
			const parsedOutput = parse(stringedOutput, `${emSuccess} **Output**`);

			const successInputEmbed = new MessageEmbed(defaultEmbedOptions(intr)).setDescription(
				parsedInput ?? "No input"
			);

			const successOutputEmbed = new MessageEmbed(defaultEmbedOptions(intr))
				.setDescription(parsedOutput ?? "No output")
				.setFooter(`${timeTaken} • ${type} (${constructor})`);

			const output: EvalOutput = {
				embeds: [successInputEmbed, successOutputEmbed],
				output: stringedOutput,
				type: "output"
			};

			return output;
		} catch (err) {
			const error = err as Error;
			const msg = error.stack ?? error.toString();

			const parsedInput = parse(code, `${emInput} **Input**`);
			const parsedError = parse(msg, `${emError} **Error**`, null);

			const errorInputEmbed = new MessageEmbed(defaultEmbedOptions(intr))
				.setColor(client.colors.red)
				.setDescription(parsedInput ?? "No input");

			const errorOutputEmbed = new MessageEmbed(defaultEmbedOptions(intr))
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
			.setEmoji((type === "error" ? emError : emSuccess) ?? "📤");

		const codeButton = new MessageButton() //
			.setLabel("Full input")
			.setCustomId("code")
			.setStyle("SECONDARY")
			.setEmoji(emInput ?? "📥");

		buttonManager.setRows(outputButton, codeButton).setUser(intr.user);

		const msg = (await intr.editReply({ embeds, components: buttonManager.rows })) as Message;
		const collector = buttonManager.setMessage(msg).createCollector();

		collector.on("collect", (interaction) => {
			if (interaction.customId === "output") {
				const attachment = new MessageAttachment(Buffer.from(output), `${type}.txt`);

				interaction.followUp({ files: [attachment] });

				buttonManager.disable("output");
				interaction.update({ components: buttonManager.rows });

				intr.logger.log(`Sent output as an attachment:\n${Util.indent(output)}`);
			}
			//
			else if (interaction.customId === "code") {
				const attachment = new MessageAttachment(Buffer.from(code), "code.txt");

				interaction.followUp({ files: [attachment] });

				buttonManager.disable("code");
				interaction.update({ components: buttonManager.rows });

				intr.logger.log(`Sent code as an attachment:\n${Util.indent(code)}`);
			}
		});
	}

	intr.logger.log(`Code:\n${Util.indent(code, 4)}`, `Output:\n${Util.indent(output, 4)}`);
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
