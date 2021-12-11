import { type Client } from "discord.js";

export async function execute(client: Client<true>) {
	client.events.logger //
		.setEvent("invalidated")
		.log("Session was invalidated");
}
