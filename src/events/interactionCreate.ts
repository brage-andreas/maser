import type { CommandInteraction } from "../typings.js";
import type { Client } from "../modules/index.js";
import { CommandLogger } from "../utils/logger/index.js";

export async function execute(client: Client, intr: CommandInteraction) {
	if (!intr.isCommand() || !intr.inCachedGuild()) return;

	const { emIdRed: emId, emWIP } = client.systemEmojis;
	const isNotOwner = intr.user.id !== client.application.owner?.id;

	intr.logger = new CommandLogger(intr);

	const commandData = client.commands.get(intr.commandName);
	const command = client.command.setCommand(intr, commandData);

	if (command.isWIP && isNotOwner) {
		await intr.reply({ content: `${emWIP} This command is work-in-progress`, ephemeral: true });
		return;
	}

	if (command.isPrivate && isNotOwner) {
		await intr.reply({ content: `${emId} This command is private`, ephemeral: true });
		return;
	}

	await intr.deferReply({ ephemeral: command.hidden });

	command.execute();
}
