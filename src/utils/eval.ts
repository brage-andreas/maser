import type { CommandInteraction, EvalOutput, RawEvalOutput } from "../typings.js";
import type { Client } from "../extensions/";

import Discord, { Message, MessageEmbed } from "discord.js";
import { TOKEN_REGEX } from "../constants.js";
import { performance } from "perf_hooks";
import Util from "./";
import ms from "ms";

// HOW DOES THIS ERROR WHEN I DON'T RESOLVE PROMISES THAT REJECT
// I DON'T GET IT :(

const rawEval = (code: string, that: CommandInteraction | Message): Promise<RawEvalOutput> => {
	return new Promise(async (resolve, reject) => {
		const D = Discord;
		const client = that.client as Client;

		const start = performance.now();
		await eval(`(async () => {\n${code}\n})()`)
			.then((result: any) => resolve({ result, time: performance.now() - start }))
			.catch((err: Error) => reject(err));
	});
};

const stringify = (output: any): string => {
	if (!output) return `${output}`;
	if (typeof output === "function") return output.toString();

	return JSON.stringify(output, null, 2) ?? "Something went wrong with the output";
};

const parse = (output: string, label: string, embedStyle?: string) => {
	return Util.FitCodeblock(output, { label, lang: embedStyle ?? "js", size: 4096 });
};

export default async function evaluate(code: string, that: CommandInteraction | Message) {
	const author = that instanceof Message ? that.author : that.user;
	const authorName = `${author.tag} (${author.id})`;
	const authorAvatar = author.displayAvatarURL();
	const client = that.client as Client;

	return await rawEval(code, that)
		.then((raw: RawEvalOutput) => {
			const { result, time } = raw;

			const type = typeof result;
			const constructor = result ? (result.constructor.name as string) : "Nullish";
			const timeTaken = ms(Number(time.toFixed(3)), { long: true }).replace(".", ",");

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
		})
		.catch((error: Error) => {
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
		});
}
