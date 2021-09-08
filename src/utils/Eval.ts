import type { CmdIntr } from "../Typings.js";
import type { Clint } from "../extensions/Clint.js";

import Discord, { Message, MessageEmbed, MessageAttachment } from "discord.js";
import { performance } from "perf_hooks";
import { TOKEN_REGEX } from "../Constants.js";
import ms from "ms";

interface OutEval {
	embeds: MessageEmbed[];
	files?: MessageAttachment[];
	output: string;
}

const wrap = (str: string) => `\`\`\`js\n${str}\n\`\`\``;
const WRAP_LEN = 10;

const parseOutput = (output: string | undefined | null) => {
	const files: MessageAttachment[] = [];

	if (!output) return { output: wrap(`${output}`), files };
	const tooLong = output.length + WRAP_LEN > 1024;
	const evaluated = tooLong ? "Output was too long. Use the buttons below to see it." : wrap(output);

	if (tooLong) {
		const outputBuffer = Buffer.from(output);
		files.push(new MessageAttachment(outputBuffer, "output.txt"));
	}

	return { output: evaluated, files };
};

const parseInput = (input: string) => {
	if (!input) return "```\nNo input\n```";

	if (input.length + WRAP_LEN > 1024) {
		return wrap(input.slice(0, 1021 - WRAP_LEN) + "...");
	} else {
		return wrap(input);
	}
};

const stringify = (raw: any): string => {
	if (!raw || typeof raw === "function") {
		return !raw ? `${raw}` : raw.toString();
	} else {
		return JSON.stringify(raw, null, 2);
	}
};

export async function evaluate(that: Message | CmdIntr, code: string, async = true) {
	const author = that instanceof Message ? that.author : that.user;

	// * FOR EVAL USE
	const client = that.client as Clint;
	const D = Discord; // Can't use it without this for some reason

	const testId = async (id: string) => {
		return await that.client.users
			.fetch(id)
			.then((user) => `${user.tag} ${user.id}`)
			.catch(() => null);
	};
	// *

	try {
		if (!code) throw new Error("'code' must be non-empty string");

		const method = `(${async ? "async" : ""} () => {\n${code}\n})()`;

		const start = performance.now();
		const rawOutput = await eval(method);
		const end = performance.now();

		const type = typeof rawOutput;
		const constructor = rawOutput ? (rawOutput.constructor.name as string) : "Nullish";
		const timeTaken = ms(Number((end - start).toFixed(3)), { long: true }).replace(".", ",");

		const outputStr = stringify(rawOutput);
		const cleanOutput = outputStr.replaceAll(new RegExp(TOKEN_REGEX, "g"), "[REDACTED]");

		const { output, files } = parseOutput(cleanOutput);
		const input = parseInput(code);

		const successEmbed = new MessageEmbed()
			.setAuthor(`${author.tag} (${author.id})`, author.displayAvatarURL())
			.setColor(client.colors.try("GREEN"))
			.addField("Input", input)
			.addField("Output", output)
			.setFooter(`${timeTaken} • ${type} (${constructor})`)
			.setTimestamp();

		return { files, embeds: [successEmbed], output: cleanOutput } as OutEval;
	} catch (err) {
		const error = err as Error; // stupid
		const errorStr = error.stack ?? error.message ?? error.toString();

		const { output, files } = parseOutput(errorStr);
		const input = parseInput(code);

		const errorEmbed = new MessageEmbed()
			.setAuthor(`${author.tag} (${author.id})`, author.displayAvatarURL())
			.setColor(client.colors.try("RED"))
			.addField("Input", input)
			.addField("Error", output)
			.setFooter("Evaluation failed")
			.setTimestamp();

		return { files, embeds: [errorEmbed], output: errorStr } as OutEval;
	}
}
