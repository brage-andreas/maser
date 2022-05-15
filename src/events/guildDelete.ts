import { type Client, type Guild } from "discord.js";

export function execute(client: Client<true>, guild: Guild) {
	client.events.logger
		.setEvent("guild delete")
		.log(`Left ${guild.name} (${guild.id})`);
}
