import type { Message } from "discord.js";
import type { Clint } from "../extensions/Clint.js";
import { CODEBLOCK_REGEX, CODE_REGEX, ID_REGEX, USER_REGEX } from "../Constants.js";
import { evaluate } from "../utils/Eval.js";

export async function execute(client: Clint, msg: Message) {
	if (msg.author.id !== client.application?.owner?.id || !client.user) return;
	if (msg.channel.type === "DM" || !msg.guild) return;

	const split = msg.content.split(/\s+/g);
	const [mention, command] = split.splice(0, 2);
	if (!mention || !command) return;

	const argument = split[0];

	const isId = ID_REGEX.test(mention);
	const isMention = USER_REGEX.test(mention);
	const cleanId = mention.replaceAll(/\D/g, "");

	if (!(isId || isMention) && cleanId === client.user.id) return;

	// TODO: real system for build/clear
	if (command === "build") {
		if (!argument || !["client", "guild"].includes(argument.toLowerCase()))
			return msg.reply(`Unknown type: ${argument ?? "No type provided"}\nMust be one of "client", "guild"`);

		msg.delete().catch(() => null);
		client.commands.put(client.user.id, argument === "guild" ? msg.guild.id : undefined);
		return;
	}

	// TODO: real system for build/clear
	if (command === "clear") {
		if (!argument || !["client", "guild"].includes(argument.toLowerCase()))
			return msg.reply(`Unknown type: ${argument ?? "No type provided"}\nMust be one of "client", "guild"`);

		msg.delete().catch(() => null);
		client.commands.clear(client.user.id, argument === "guild" ? msg.guild.id : undefined);
		return;
	}

    // Temporary eval until multi-line slashies
	if (command === "eval") {
		const captured = (msg.content.match(CODEBLOCK_REGEX) ?? msg.content.match(CODE_REGEX))?.groups;
		const code = captured?.code ?? split.join(" ");

		const { embeds, files } = await evaluate(msg, code);

		msg.reply({ embeds, files });
		return;
	}
}
