import type { CommandInteraction, Command } from "../../typings.js";
import type { ChatInputApplicationCommandData } from "discord.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export const options = {
	private: true
};

const data: ChatInputApplicationCommandData = {
	name: "build",
	description: "Build commands",
	options: [
		{
			name: "global",
			description: "Build global commands",
			type: ApplicationCommandOptionTypes.SUB_COMMAND
		},
		{
			name: "guild",
			description: "Build guild commands",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: [
				{
					name: "guild",
					description: "A specific guild to build to",
					type: ApplicationCommandOptionTypes.STRING
				}
			]
		}
	]
};

async function execute(intr: CommandInteraction) {
	const type = intr.options.getSubcommand(true);
	const guildId = intr.options.getString("guild") ?? intr.guildId;
	const clientId = intr.client.user.id;

	if (type === "guild") {
		const guild = intr.client.guilds.cache.get(guildId);
		if (!guild) {
			intr.editReply("I couldn't find the guild");
			return;
		}

		intr.client.commands.put(clientId, guildId);
		intr.logger.log(`Put commands in guild: ${guild.name} (${guild.id})`);
	} else {
		intr.client.commands.put(clientId);
		intr.logger.log("Put commands in global commands");
	}
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
