import type { Clint } from "../extensions/Clint";
import type { Guild } from "discord.js";

export async function execute(client: Clint, guild: Guild) {
	client.events.logger
		.setEvent("guild create")
		.log(
			`Joined ${guild.name} (${guild.id})`,
			`with ${guild.channels.cache.size} channels and ${guild.memberCount} members`
		);
}
