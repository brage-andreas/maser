import type { Client } from "../extensions/";

export async function execute(client: Client) {
	const guilds = client.guilds.cache.size;
	const users = client.guilds.cache.reduce((count, guild) => count + guild.memberCount, 0);

	client.logger.log(
		`Logged on as ${client.user.tag} (${client.user.id})`,
		`In ${guilds} guilds with ${users} total members`
	);

	if (!client.application.owner) await client.application.fetch();
}
