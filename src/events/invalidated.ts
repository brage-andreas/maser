import { type Client } from "discord.js";

export function execute(client: Client<true>) {
	client.events.logger //
		.setEvent("invalidated")
		.log("Session was invalidated");
}
