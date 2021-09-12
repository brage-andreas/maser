import type { Clint } from "../extensions/Clint.js";

export async function execute(client: Clint) {
	const guilds = client.guilds.cache.size;
	const channels = client.channels.cache.size;
	const users = client.guilds.cache.reduce((count, guild) => count + guild.memberCount, 0);

	client.logger.log(
		`Logged on as ${client.user!.tag} (${client.user!.id})`,
		`In ${guilds} guilds, ${channels} channels, and ${users} users`
	);

	if (!client.application.owner) await client.application?.fetch();
}
