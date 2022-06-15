import { type Client } from "discord.js";
import Logger from "../loggers/index.js";

export async function execute(client: Client<true>) {
	const logger = new Logger({
		type: "READY",
		colour: "yellow"
	});

	const guilds = client.guilds.cache.size;

	const users = client.guilds.cache.reduce(
		(count, guild) => count + guild.memberCount,
		0
	);

	logger.log(
		`Logged on as ${client.user.tag} (${client.user.id})`,
		`In ${guilds} guilds with ${users} total members`
	);

	if (!client.application.owner) {
		await client.application.fetch();
	}
}
