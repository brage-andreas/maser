import { Message } from "discord.js";
import { Clint } from "../extensions/Clint.js";

export async function execute(client: Clint, msg: Message) {
	if (msg.author.id !== client.application?.owner?.id || !client.user) return;
	if (msg.channel.type === "DM" || !msg.guild) return;

	const [command, argument] = msg.content.split(/\s+/g).slice(0, 2);
	if (!command) return;

	if (command === "?build") {
		if (!argument || !["client", "guild"].includes(argument.toLowerCase()))
			return msg.reply(`Unknown type: ${argument ?? "No type provided"}\nMust be one of "client", "guild"`);

		msg.delete();
		client.commands.put(client.user.id, argument === "guild" ? msg.guild.id : undefined);
		return;
	}

	if (command === "?clear") {
		if (!argument || !["client", "guild"].includes(argument.toLowerCase()))
			return msg.reply(`Unknown type: ${argument ?? "No type provided"}\nMust be one of "client", "guild"`);

		msg.delete();
		client.commands.clear(client.user.id, argument === "guild" ? msg.guild.id : undefined);
		return;
	}
}
