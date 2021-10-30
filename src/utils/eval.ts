import type { CommandInteraction, EvalOutput } from "../typings.js";
import type { Client } from "../extensions/";

import Discord, { MessageEmbed, Message } from "discord.js";
import { performance } from "perf_hooks";
import { REGEX } from "../constants.js";
import Util from "./";
import ms from "ms";

const stringify = (output: any): string => {
	if (!output) return `${output}`;
	if (typeof output === "function") return output.toString();

	return JSON.stringify(output, null, 2) ?? "Something went wrong with the output";
};

const parse = (string: string, label: string, embedStyle?: string) => {
	if (!string.length) return null;
	return Util.fitCodeblock(string, { label, lang: embedStyle ?? "js", size: 4096 });
};

export default async function evaluate(code: string, that: CommandInteraction | Message) {
	const author = that instanceof Message ? that.author : that.user;
	const authorName = `${author.tag} (${author.id})`;
	const authorAvatar = author.displayAvatarURL();

	const client = that.client as Client;
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

		const stringedOutput = stringify(result).replaceAll(new RegExp(REGEX.TOKEN, "g"), "[REDACTED]");

		const parsedInput = parse(code, `${emInput}**Input**`);
		const parsedOutput = parse(stringedOutput, `${emSuccess}**Output**`);

		const successInputEmbed = new MessageEmbed()
			.setAuthor(authorName, authorAvatar)
			.setColor(client.colors.try("GREEN"))
			.setDescription(parsedInput ?? "No input")
			.setTimestamp();

		const successOutputEmbed = new MessageEmbed()
			.setAuthor(authorName, authorAvatar)
			.setColor(client.colors.try("GREEN"))
			.setDescription(parsedOutput ?? "No output")
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

		const parsedInput = parse(code, `${emInput}**Input**`);
		const parsedError = parse(msg, `${emError}**Error**`);

		const errorInputEmbed = new MessageEmbed()
			.setAuthor(authorName, authorAvatar)
			.setColor(client.colors.try("RED"))
			.setDescription(parsedInput ?? "No input")
			.setTimestamp();

		const errorOutputEmbed = new MessageEmbed()
			.setAuthor(authorName, authorAvatar)
			.setColor(client.colors.try("RED"))
			.setDescription(parsedError ?? "No error")
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
