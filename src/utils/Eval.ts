import type { Message } from "discord.js";
import type { CmdIntr } from "../Typings.js";

import Discord, { MessageEmbed, MessageAttachment } from "discord.js";
import { performance } from "perf_hooks";

interface OutEval {
	embeds: MessageEmbed[];
	files?: MessageAttachment[];
	error?: string;
}

const wrap = (str: string) => `\`\`\`js\n${str}\n\`\`\``;

export async function evaluate(that: Message | CmdIntr, code: string) {
	const D = Discord;

	try {
		const output = await eval(`(async () => {\n${code}\n})()`);
	} catch (error) {
		//
	}
}
