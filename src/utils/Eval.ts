import type { CmdIntr } from "../typings.js";

import Discord, { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { TOKEN_REGEX } from "../constants.js";
import { performance } from "perf_hooks";
import { Clint } from "../extensions";
import ms from "ms";

// HOW DOES THIS ERROR WHEN I DON'T RESOLVE PROMISES THAT REJECT
// I DON'T GET IT :(

interface RawEvalOutput {
	result: any;
	time: number;
}

interface EvalOutput {
	files?: MessageAttachment[];
	embeds: MessageEmbed[];
	output: string;
}

const wrap = (str: string, style: string | null) => `\`\`\`${style ?? ""}\n${str}\n\`\`\``;

const MAX_EMBED_LEN = 4096;
const WRAP_LEN = 10;
const SAFE_EMBED_LEN = MAX_EMBED_LEN - WRAP_LEN - 3;

const _eval = (code: string, that: CmdIntr | Message): Promise<RawEvalOutput> => {
	return new Promise(async (resolve, reject) => {
		const D = Discord;
		const client = that.client as Clint;

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

const parse = (output: string, fileName: string, embedStyle: string | null) => {
	const files: MessageAttachment[] = [];

	const actualLength = output.length + WRAP_LEN;

	const tooLong = actualLength > MAX_EMBED_LEN;
	const evaluated = tooLong ? wrap(output.slice(0, SAFE_EMBED_LEN) + "...", embedStyle) : wrap(output, embedStyle);

	if (tooLong) {
		const file = new MessageAttachment(Buffer.from(output), fileName);
		files.push(file);
	}

	return { parsed: evaluated, files };
};

export default async function evaluate(code: string, that: CmdIntr | Message) {
	const author = that instanceof Message ? that.author : that.user;
	const authorName = `${author.tag} (${author.id})`;
	const authorAvatar = author.displayAvatarURL();
	const client = that.client as Clint;

	return await _eval(code, that)
		.then((raw: RawEvalOutput) => {
			const { result, time } = raw;

			const type = typeof result;
			const constructor = result ? (result.constructor.name as string) : "Nullish";
			const timeTaken = ms(Number(time.toFixed(3)), { long: true }).replace(".", ",");

			const stringedOutput = stringify(result).replaceAll(new RegExp(TOKEN_REGEX, "g"), "[REDACTED]");

			const { parsed: parsedInput, files: inputFiles } = parse(code, "code.txt", "js");
			const { parsed: parsedOutput, files: outputFiles } = parse(stringedOutput, "output.txt", "js");
			const files = outputFiles.concat(inputFiles);

			const successInputEmbed = new MessageEmbed()
				.setAuthor(authorName, authorAvatar)
				.setColor(client.colors.try("GREEN"))
				.setDescription("**Input**\n" + parsedInput)
				.setTimestamp();

			const successOutputEmbed = new MessageEmbed()
				.setAuthor(authorName, authorAvatar)
				.setColor(client.colors.try("GREEN"))
				.setDescription("**Output**\n" + parsedOutput)
				.setFooter(`${timeTaken} • ${type} (${constructor})`)
				.setTimestamp();

			const output: EvalOutput = {
				embeds: [successInputEmbed, successOutputEmbed],
				output: stringedOutput,
				files
			};

			return output;
		})
		.catch((error: Error) => {
			const msg = error.stack ?? error.toString();

			const { parsed: parsedInput, files: inputFiles } = parse(code, "code.txt", "js");
			const { parsed: parsedError, files: errorFiles } = parse(msg, "error.txt", null);
			const files = errorFiles.concat(inputFiles);

			const errorInputEmbed = new MessageEmbed()
				.setAuthor(authorName, authorAvatar)
				.setColor(client.colors.try("RED"))
				.setDescription("**Input**\n" + parsedInput)
				.setTimestamp();

			const errorOutputEmbed = new MessageEmbed()
				.setAuthor(authorName, authorAvatar)
				.setColor(client.colors.try("RED"))
				.setDescription("**Error**\n" + parsedError)
				.setFooter("Evaluation failed")
				.setTimestamp();

			const output: EvalOutput = {
				embeds: [errorInputEmbed, errorOutputEmbed],
				output: msg,
				files
			};

			return output;
		});
}
