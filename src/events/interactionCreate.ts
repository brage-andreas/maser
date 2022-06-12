import { type Client, type Interaction } from "discord.js";
import { CommandLogger } from "../loggers/index.js";
import CommandHelper from "../modules/CommandHelper.js";

export async function execute(client: Client<true>, intr: Interaction) {
	const emojis = client.maserEmojis;

	if (!intr.inGuild()) {
		if (!intr.isCommand()) {
			return;
		}

		intr.reply({
			content: `${emojis.lock} My commands are only accessible inside servers!`,
			ephemeral: true
		});

		return;
	}

	if (
		(!intr.isChatInputCommand() && !intr.isAutocomplete()) ||
		!intr.inCachedGuild()
	) {
		return;
	}

	if (intr.member.partial) {
		await intr.member.fetch();
	}

	const isNotOwner = intr.user.id !== client.application.owner?.id;

	intr.commandOptions = new CommandHelper(intr);
	intr.logger = new CommandLogger(intr);

	const command = intr.commandOptions.setCommand(intr);

	if (intr.isAutocomplete()) {
		return command.execute();
	}

	if (command.isWIP && isNotOwner) {
		await intr.reply({
			content: `${emojis.wip} This command is work-in-progress`,
			ephemeral: true
		});

		return;
	}

	if (command.isPrivate && isNotOwner) {
		await intr.reply({
			content: `${emojis.lock} This command is private`,
			ephemeral: true
		});

		return;
	}

	await intr.deferReply({ ephemeral: command.isHidden });

	command.execute();
}
