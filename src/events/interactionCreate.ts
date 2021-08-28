import type { CmdIntr } from "../Typings.js";
import type { Clint } from "../extensions/Clint.js";
import { CommandLogger } from "../utils/CommandLogger.js";

export async function execute(client: Clint, intr: CmdIntr) {
	if (!intr.isCommand()) return;

	intr.logger = new CommandLogger(intr);
	client.commands.execute(intr);
}
