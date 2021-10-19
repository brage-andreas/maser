import type { CommandInteraction } from "../typings.js";
import type { Client } from "../extensions/";
import { CommandLogger } from "../utils/logger/";

export async function execute(client: Client, intr: CommandInteraction) {
	if (!intr.isCommand() || !intr.guild || !intr.member) return;

	const [locked] = intr.client.moji.findAndParse("locked");

	intr.logger = new CommandLogger(intr);

	const commandData = client.commands.get(intr);
	const command = client.command.setCommand(intr, commandData);

	if (command.isPrivate) {
		if (intr.user.id !== client.application.owner?.id) {
			await intr.reply({ content: `${locked}This command is private`, ephemeral: true });
			return;
		}
	}

	const ephemeral = command.hidden;
	await intr.deferReply({ ephemeral });

	command.execute();
}
