import { Client } from "../modules/index.js";

export async function execute(client: Client, info: string) {
	client.events.logger //
		.setEvent("warn")
		.log(info);
}
