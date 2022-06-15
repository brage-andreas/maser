import { type Client } from "discord.js";

export function execute(client: Client<true>, info: string) {
	client.eventHandler.logger //
		.setEvent("warn")
		.log(info);
}
