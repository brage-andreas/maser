import type { Clint } from "../extensions/Clint";
import type { Guild } from "discord.js";

export async function execute(client: Clint, guild: Guild) {
    client.events.logger.setEvent("guild delete").log(`Left ${guild.name} (${guild.id})`);
}