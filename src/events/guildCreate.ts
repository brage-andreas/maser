import { type Client, type Guild } from "discord.js";

export function execute(client: Client<true>, guild: Guild) {
	client.eventHandler.logger
		.setEvent("guild create")
		.log(
			`Joined ${guild.name} (${guild.id})`,
			`with ${guild.channels.cache.size} channels and ${guild.memberCount} members`
		);
}
