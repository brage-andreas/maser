import { Client } from "../extensions/";

export async function execute(client: Client, info: string) {
	client.events.logger //
		.setEvent("warn")
		.log(info);
}
