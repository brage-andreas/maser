import { type Interaction } from "discord.js";
import { e } from "../emojis/index.js";
import Logger from "../loggers/index.js";
import CommandHelper from "../modules/CommandHelper.js";

export async function execute(intr: Interaction) {
	if (!intr.inGuild()) {
		if (!intr.isCommand()) {
			return;
		}

		intr.reply({
			content: e`{lock} My commands are only accessible inside servers!`,
			ephemeral: true
		});

		return;
	}

	if (!intr.isChatInputCommand() || !intr.inCachedGuild()) {
		return;
	}

	if (intr.member.partial) {
		await intr.member.fetch();
	}

	intr.commandOptions = new CommandHelper(intr);
	const command = intr.commandOptions.setCommand(intr);

	const isNotOwner = intr.user.id !== intr.client.application.owner?.id;
	const logger = new Logger({
		colour: "green",
		type: intr.commandName
	});

	logger.setInteraction(intr);

	if (command.isWIP && isNotOwner) {
		await intr.reply({
			content: e`{wip} This command is work-in-progress`,
			ephemeral: true
		});

		return;
	}

	if (command.isPrivate && isNotOwner) {
		await intr.reply({
			content: e`{lock} This command is private`,
			ephemeral: true
		});

		return;
	}

	await intr.deferReply({ ephemeral: command.isHidden });

	command.execute(logger);
}
