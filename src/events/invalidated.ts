import type { Client } from "../extensions/";

export async function execute(client: Client) {
	client.events.logger //
		.setEvent("invalidated")
		.log("Session was invalidated");
}
