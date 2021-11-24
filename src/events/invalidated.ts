import type { Client } from "../modules/index.js";

export async function execute(client: Client) {
	client.events.logger //
		.setEvent("invalidated")
		.log("Session was invalidated");
}
