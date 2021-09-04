import type { CmdIntr } from "../Typings.js";
import type { Clint } from "../extensions/Clint.js";
import { CommandLogger } from "../utils/logger/CommandLogger.js";

export async function execute(client: Clint, intr: CmdIntr) {
	if (!intr.isCommand()) return;

	const ephemeral = client.commands.getDefaultHide(intr);
	await intr.deferReply({ ephemeral });

	intr.logger = new CommandLogger(intr);
	client.commands.execute(intr);
}
