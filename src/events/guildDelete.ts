import type { Client } from "../modules/index.js";
import type { Guild } from "discord.js";

export async function execute(client: Client, guild: Guild) {
	client.events.logger.setEvent("guild delete").log(`Left ${guild.name} (${guild.id})`);
}
