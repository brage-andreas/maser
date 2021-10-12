import type { CommandInteraction, EvalOutput } from "../typings.js";
import type { Client } from "../extensions/";

import Discord, { Message, MessageEmbed } from "discord.js";
import { TOKEN_REGEX } from "../constants.js";
import { performance } from "perf_hooks";
import Util from "./";
import ms from "ms";

const stringify = (output: any): string => {
	if (!output) return `${output}`;
	if (typeof output === "function") return output.toString();

	return JSON.stringify(output, null, 2) ?? "Something went wrong with the output";
};

const parse = (output: string, label: string, embedStyle?: string) => {
	return Util.fitCodeblock(output, { label, lang: embedStyle ?? "js", size: 4096 });
};

export default async function evaluate(code: string, that: CommandInteraction | Message) {
	const author = that instanceof Message ? that.author : that.user;
	const authorName = `${author.tag} (${author.id})`;
	const authorAvatar = author.displayAvatarURL();

	const client = that.client as Client;
	Discord; // "ReferenceError: Discord is not defined" if not here

	try {
		const start = performance.now();
		const result = await eval(`(async () => {\n${code}\n})()`);
		const end = performance.now();

		const type = typeof result;
		const constructor = result == null ? (result.constructor.name as string) : "Nullish";

		const time = Number((end - start).toFixed(3));
		const timeTaken = ms(time, { long: true }).replace(".", ",");

		const stringedOutput = stringify(result).replaceAll(new RegExp(TOKEN_REGEX, "g"), "[REDACTED]");

		const parsedInput = parse(code, "**Input**");
		const parsedOutput = parse(stringedOutput, "**Output**");

		const successInputEmbed = new MessageEmbed()
			.setAuthor(authorName, authorAvatar)
			.setColor(client.colors.try("GREEN"))
			.setDescription(parsedInput)
			.setTimestamp();

		const successOutputEmbed = new MessageEmbed()
			.setAuthor(authorName, authorAvatar)
			.setColor(client.colors.try("GREEN"))
			.setDescription(parsedOutput)
			.setFooter(`${timeTaken} • ${type} (${constructor})`)
			.setTimestamp();

		const output: EvalOutput = {
			embeds: [successInputEmbed, successOutputEmbed],
			output: stringedOutput,
			type: "output"
		};

		return output;
	} catch (err) {
		const error = err as Error;
		const msg = error.stack ?? error.toString();

		const parsedInput = parse(code, "**Input**");
		const parsedError = parse(msg, "**Error**");

		const errorInputEmbed = new MessageEmbed()
			.setAuthor(authorName, authorAvatar)
			.setColor(client.colors.try("RED"))
			.setDescription(parsedInput)
			.setTimestamp();

		const errorOutputEmbed = new MessageEmbed()
			.setAuthor(authorName, authorAvatar)
			.setColor(client.colors.try("RED"))
			.setDescription(parsedError)
			.setFooter("Evaluation failed")
			.setTimestamp();

		const output: EvalOutput = {
			embeds: [errorInputEmbed, errorOutputEmbed],
			output: msg,
			type: "error"
		};

		return output;
	}
}
