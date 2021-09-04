import type { Guild } from "discord.js";

// temporary
export async function getLogChannel(guild: Guild) {
	return guild.channels.cache.find((ch) => ch.name === "bot-log") ?? null;
}
