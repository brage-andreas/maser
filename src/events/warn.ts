import { type Client } from "discord.js";

export async function execute(client: Client<true>, info: string) {
	client.events.logger //
		.setEvent("warn")
		.log(info);
}
