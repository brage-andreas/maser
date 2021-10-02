import { Clint } from "../extensions/";

export async function execute(client: Clint, info: string) {
	client.events.logger //
		.setEvent("warn")
		.log(info);
}
