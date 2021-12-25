import { GuildMember, type AutocompleteInteraction, type Client, type CommandInteraction } from "discord.js";
import { CommandLogger } from "../logger/index.js";
import { CommandManager } from "../modules/index.js";

export async function execute(client: Client<true>, intr: CommandInteraction | AutocompleteInteraction) {
	if (intr.member instanceof GuildMember && intr.member.partial) await intr.member.fetch();
	if ((!intr.isCommand() && !intr.isAutocomplete()) || !intr.inCachedGuild()) return;

	const { emIdRed: emId, emWIP } = client.systemEmojis;
	const isNotOwner = intr.user.id !== client.application.owner?.id;

	intr.commandOptions = new CommandManager(intr);
	intr.logger = new CommandLogger(intr);

	const commandData = client.commandHandler.getData(intr.commandName);
	const commandOptions = intr.commandOptions.setCommand(intr, commandData);

	if (intr.isAutocomplete()) return commandOptions.execute();

	if (commandOptions.isWIP && isNotOwner) {
		await intr.reply({ content: `${emWIP} This command is work-in-progress`, ephemeral: true });
		return;
	}

	if (commandOptions.isPrivate && isNotOwner) {
		await intr.reply({ content: `${emId} This command is private`, ephemeral: true });
		return;
	}

	await intr.deferReply({ ephemeral: commandOptions.hide });

	commandOptions.execute();
}
