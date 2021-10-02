import type { CmdIntr } from "../typings.js";
import type { Clint } from "../extensions/";
import { CommandLogger } from "../utils/logger/";

export async function execute(client: Clint, intr: CmdIntr) {
	if (!intr.isCommand() || !intr.guild || !intr.member) return;

	const ephemeral = client.commands.getDefaultHide(intr);
	await intr.deferReply({ ephemeral });

	intr.logger = new CommandLogger(intr);
	client.commands.execute(intr);
}
