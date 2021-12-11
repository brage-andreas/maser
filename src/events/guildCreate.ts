import { type Client, type Guild } from "discord.js";

export async function execute(client: Client<true>, guild: Guild) {
	client.events.logger
		.setEvent("guild create")
		.log(
			`Joined ${guild.name} (${guild.id})`,
			`with ${guild.channels.cache.size} channels and ${guild.memberCount} members`
		);
}
