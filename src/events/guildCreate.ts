import { type Guild } from "discord.js";
import Logger from "../loggers/index.js";

export function execute(guild: Guild) {
	const logger = new Logger({
		type: "GUILD CREATE",
		colour: "yellow"
	});

	logger.log(
		`Joined ${guild.name} (${guild.id})`,
		`with ${guild.channels.cache.size} channels and ${guild.memberCount} members`
	);
}
