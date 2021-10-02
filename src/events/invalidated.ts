import type { Clint } from "../extensions/";

export async function execute(client: Clint) {
	client.events.logger //
		.setEvent("invalidated")
		.log("Session was invalidated");
}
