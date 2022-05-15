import { type Client, type Interaction } from "discord.js";
import { CommandLogger } from "../logger/index.js";
import { CommandManager } from "../modules/index.js";

export async function execute(client: Client<true>, intr: Interaction) {
	if (!intr.guildId) {
		if (!intr.isCommand()) {
			return;
		}

		intr.reply({
			content: `${intr.client.maserEmojis.lock} My commands are only accessible inside servers!`,
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

	const emojis = client.maserEmojis;
	const isNotOwner = intr.user.id !== client.application.owner?.id;

	intr.commandOptions = new CommandManager(intr);

	intr.logger = new CommandLogger(intr);

	const commandData = client.commandHandler.getData(intr.commandName);
	const commandOptions = intr.commandOptions.setCommand(intr, commandData);

	if (intr.isAutocomplete()) {
		return commandOptions.execute();
	}

	if (commandOptions.isWIP && isNotOwner) {
		await intr.reply({
			content: `${emojis.wip} This command is work-in-progress`,
			ephemeral: true
		});

		return;
	}

	if (commandOptions.isPrivate && isNotOwner) {
		await intr.reply({
			content: `${emojis.lock} This command is private`,
			ephemeral: true
		});

		return;
	}

	await intr.deferReply({ ephemeral: commandOptions.hide });

	commandOptions.execute();
}
