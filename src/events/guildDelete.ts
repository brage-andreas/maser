import type { Clint } from "../extensions/";
import type { Guild } from "discord.js";

export async function execute(client: Clint, guild: Guild) {
	client.events.logger.setEvent("guild delete").log(`Left ${guild.name} (${guild.id})`);
}
