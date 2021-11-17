import type { Client } from "../extensions/index.js";

export async function execute(client: Client) {
	client.events.logger //
		.setEvent("invalidated")
		.log("Session was invalidated");
}
