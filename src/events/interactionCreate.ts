import type { CommandInteraction } from "../typings.js";
import type { Client } from "../extensions/";
import { CommandLogger } from "../utils/logger/";

export async function execute(client: Client, intr: CommandInteraction) {
	if (!intr.isCommand() || !intr.inCachedGuild()) return;

	const [idEm, wip] = intr.client.moji.findAndParse("id-red", "wip");
	const isNotOwner = intr.user.id !== client.application.owner?.id;

	intr.logger = new CommandLogger(intr);

	const commandData = client.commands.get(intr);
	const command = client.command.setCommand(intr, commandData);

	if (command.isWIP) {
		if (isNotOwner) {
			await intr.reply({ content: `${wip}This command is work-in-progress`, ephemeral: true });
			return;
		}
	}

	if (command.isPrivate) {
		if (isNotOwner) {
			await intr.reply({ content: `${idEm}This command is private`, ephemeral: true });
			return;
		}
	}

	const ephemeral = command.hidden;
	await intr.deferReply({ ephemeral });

	command.execute();
}
