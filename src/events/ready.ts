import { Clint } from "../extensions/Clint.js";
import Util from "../utils/index.js";

export async function execute(client: Clint) {
	const time = Util.Now();
	const guilds = client.guilds.cache.size;
	const channels = client.channels.cache.size;

	Util.Log(`[${time}] Started`);

	if (client.user)
		Util.Log(`Logged on as ${client.user.tag} (${client.user.id})`);
	Util.Log(`In ${guilds} guilds and ${channels} channels`);

	if (!client.application?.name) await client.application?.fetch();
}
