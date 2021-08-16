import { Clint } from "../extensions/Clint.js";
import Util from "../utils/index.js";

export async function execute(client: Clint) {
	console.log("  Ready");
	if (client.user)
		console.log(
			Util.Parse(`Logged on as ${client.user.tag} (${client.user.id})`)
		);
}
