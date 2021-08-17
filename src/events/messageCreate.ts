import { Message } from "discord.js";
import { Clint } from "../extensions/Clint.js";

export async function execute(client: Clint, msg: Message) {
	if (msg.author.id !== client.application?.owner?.id || !client.user) return;
	if (msg.channel.type === "DM" || !msg.guild) return;

	if (msg.content.startsWith("?build")) {
		const type = msg.content.split(/\s+/g)[1];

		if (!type || !["client", "guild"].includes(type.toLowerCase()))
			return msg.reply(`Unknown type: ${type ?? "No type provided"}\nMust be one of "client", "guild"`);

		msg.delete();
		client.commands.put(client.user.id, type === "guild" ? msg.guild.id : undefined);
	}
}
