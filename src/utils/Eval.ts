import type { CmdIntr } from "../Typings.js";
import type { Clint } from "../extensions/Clint.js";

import Discord, { Message, MessageEmbed, MessageAttachment } from "discord.js";
import ms from "ms";
import { performance } from "perf_hooks";
import { TOKEN_REGEX } from "../Constants.js";

interface OutEval {
	embeds: MessageEmbed[];
	files?: MessageAttachment[];
}

const wrap = (str: string) => `\`\`\`js\n${str}\n\`\`\``;
const WRAP_LEN = 10;

const parseOutput = (output: string | undefined | null) => {
	const files: MessageAttachment[] = [];

	if (!output) return { output: wrap(`${output}`), files };
	const tooLong = output.length + WRAP_LEN > 1024;
	const evaluated = tooLong ? "Error was too long. Sent as an attachment" : wrap(output);

	if (tooLong) {
		const outputBuffer = Buffer.from(output);
		files.push(new MessageAttachment(outputBuffer, "error.txt"));
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

const stringify = (raw: any) => {
	if (!raw || typeof raw === "function") {
		return !raw ? `${raw}` : raw.toString();
	} else {
		return JSON.stringify(raw, null, 2);
	}
};

export async function evaluate(that: Message | CmdIntr, code: string) {
	const author = that instanceof Message ? that.author : that.user;

	// D and client for use in eval
	const client = that.client as Clint;
	const D = Discord; // to scope the variable

	try {
		if (!code) throw new Error("'code' must be non-empty string");

		const start = performance.now();
		const rawOutput = await eval(`(async () => {\n${code}\n})()`);
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
			.setColor(client.colors.green)
			.addField("Input", input)
			.addField("Output", output)
			.setFooter(`${timeTaken} • ${type} (${constructor})`)
			.setTimestamp();

		return { files, embeds: [successEmbed] } as OutEval;
	} catch (error) {
		const errorStr = error.stack ?? error.toString();

		const { output, files } = parseOutput(errorStr);
		const input = parseInput(code);

		const errorEmbed = new MessageEmbed()
			.setAuthor(`${author.tag} (${author.id})`, author.displayAvatarURL())
			.setColor(client.colors.red)
			.addField("Input", input)
			.addField("Error", output)
			.setFooter("Evaluation failed")
			.setTimestamp();

		return { files, embeds: [errorEmbed] } as OutEval;
	}
}
