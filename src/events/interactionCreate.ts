import type { CommandInteraction } from "../typings.js";
import type { Client } from "../extensions/";
import { CommandLogger } from "../utils/logger/";

export async function execute(client: Client, intr: CommandInteraction) {
	if (!intr.isCommand() || !intr.guild || !intr.member) return;

	intr.logger = new CommandLogger(intr);

	const command = client.commands.setCommand(intr);
	const ephemeral = command.hidden;

	if (command.isPrivate) {
		if (intr.user.id !== client.application.owner?.id) {
			await intr.reply({ content: "This command is private", ephemeral });
			return;
		}
	}

	await intr.deferReply({ ephemeral });
	command.execute();
}
