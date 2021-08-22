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

export async function evaluate(that: Message | CmdIntr, code: string) {
	const author = that instanceof Message ? that.author : that.user;
	const D = Discord;
	const client = that.client as Clint;
	// D and client for use in eval

	try {
		const start = performance.now();
		const output = await eval(`(async () => {\n${code}\n})()`);
		const end = performance.now();

		const type = typeof output;
		const constructor = output ? (output.constructor.name as string) : "Nullish";
		const timeTaken = ms(Number((end - start).toFixed(3)), { long: true }).replace(".", ",");

		const outputStrRaw: string = type === "function" ? output.toString() : JSON.stringify(output, null, 2);
		const outputStr = outputStrRaw.replace(new RegExp(TOKEN_REGEX, "g"), "[REDACTED]");

		const tooLong = wrap(outputStr).length > 1024;
		const evaluated = tooLong ? "Response was too long. Sent as an attachment" : wrap(outputStr);

		const files = [];
		if (tooLong) {
			const outputBuffer = Buffer.from(outputStr);
			files.push(new MessageAttachment(outputBuffer, "output.txt"));
		}

		const successEmbed = new MessageEmbed()
			.setAuthor(author.tag, author.displayAvatarURL())
			.addField("Input", wrap(code))
			.addField("Output", evaluated)
			.setFooter(`${timeTaken} • ${type} (${constructor})`)
			.setTimestamp();

		return { files, embeds: [successEmbed] } as OutEval;
	} catch (error) {
		const outputStr = error.stack ?? error.toString();
		const tooLong = wrap(outputStr).length > 1024;
		const evaluated = tooLong ? "Error was too long. Sent as an attachment" : wrap(outputStr);

		const files = [];
		if (tooLong) {
			const outputBuffer = Buffer.from(outputStr);
			files.push(new MessageAttachment(outputBuffer, "error.txt"));
		}

		const errorEmbed = new MessageEmbed()
			.setAuthor(author.tag, author.displayAvatarURL())
			.addField("Input", wrap(code))
			.addField("Output", evaluated)
			.setFooter("Evaluation failed")
			.setTimestamp();

		return { files, embeds: [errorEmbed] } as OutEval;
	}
}
