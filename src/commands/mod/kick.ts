import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { BASE_MOD_CMD_OPTS } from "../../constants.js";

const data: ChatInputApplicationCommandData = {
	name: "kick",
	description: "Kicks a user off this server",
	options: [
		{
			name: "user",
			description: "The user to target",
			type: ApplicationCommandOptionTypes.USER,
			required: true
		},
		BASE_MOD_CMD_OPTS.REASON("kick")
	]
};

async function execute(intr: CommandInteraction) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");

	const { emXMark, emUserLock, emError, emCrown } = intr.client.systemEmojis;

	if (!target) {
		intr.editReply(`${emXMark} The user to target was not found in this server`);
		return;
	}

	if (!intr.guild.me?.permissions.has("KICK_MEMBERS")) {
		intr.editReply(`${emUserLock} I don't have permissions to kick users`);
		return;
	}

	if (target.id === intr.user.id) {
		intr.editReply(`${emError} You cannot do this action on yourself`);
		return;
	}

	if (target.id === intr.client.user.id) {
		intr.editReply(`${emError} I cannot do this action on myself`);
		return;
	}

	if (target.id === intr.guild.ownerId) {
		intr.editReply(`${emCrown} The user to target is the owner of this server`);
		return;
	}

	if (target.permissions.has("KICK_MEMBERS")) {
		intr.editReply(`${emXMark} The user to target cannot be kicked`);
		return;
	}

	intr.logger.log();
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
