import type { CmdIntr } from "../typings.js";
import type { Clint } from "../extensions/";
import { CommandLogger } from "../utils/logger/";

export async function execute(client: Clint, intr: CmdIntr) {
	if (!intr.isCommand() || !intr.guild || !intr.member) return;

	intr.logger = new CommandLogger(intr);

	const command = client.commands.setCommand(intr);
	const ephemeral = command.getDefaultHide(intr);

	if (command.isPrivate()) {
		if (intr.user.id !== client.application.owner?.id) {
			await intr.reply({ content: "This command is private", ephemeral });
			return;
		}
	}

	await intr.deferReply({ ephemeral });
	command.execute();
}
