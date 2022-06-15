import { type Guild } from "discord.js";
import Logger from "../loggers/index.js";

export function execute(guild: Guild) {
	const logger = new Logger({
		type: "GUILD DELETE",
		colour: "yellow"
	});

	logger.log(`Left ${guild.name} (${guild.id})`);
}
