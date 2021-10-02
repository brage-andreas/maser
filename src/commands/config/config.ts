import type { ApplicationCommandData } from "discord.js";
import type { CmdIntr } from "../../typings.js";

import { ApplicationCommandOptionType } from "discord-api-types/v9";
import ConfigManager from "../../database/config/ConfigManager.js";
import configLogs from "./options/configRoles.js";

export const data: ApplicationCommandData = {
	name: "config",
	description: "Manages this server's config",
	options: [
		{
			name: "bot-log",
			description: "Options for this server's bot log channel",
			type: ApplicationCommandOptionType.SubcommandGroup as number,
			options: [
				{
					name: "view",
					description: "Sends the option's value",
					type: ApplicationCommandOptionType.Subcommand as number
				},
				{
					name: "set",
					description: "Sets a new value for the option",
					type: ApplicationCommandOptionType.Subcommand as number,
					options: [
						{
							name: "channel",
							description: "The new channel to set to. Omitting this option will remove its value",
							channelTypes: ["GUILD_TEXT", "GUILD_NEWS", "GUILD_STORE"],
							type: ApplicationCommandOptionType.Channel as number
						}
					]
				}
			]
		},
		{
			name: "member-log",
			description: "Options for this server's member log channel",
			type: ApplicationCommandOptionType.SubcommandGroup as number,
			options: [
				{
					name: "view",
					description: "Sends the option's value",
					type: ApplicationCommandOptionType.Subcommand as number
				},
				{
					name: "set",
					description: "Sets a new value for the option",
					type: ApplicationCommandOptionType.Subcommand as number,
					options: [
						{
							name: "channel",
							description: "The new channel to set to. Omitting this option will remove its value",
							channelTypes: ["GUILD_TEXT", "GUILD_NEWS", "GUILD_STORE"],
							type: ApplicationCommandOptionType.Channel as number
						}
					]
				}
			]
		}
	]
};

export async function execute(intr: CmdIntr) {
	const option = intr.options.getSubcommandGroup();
	const method = intr.options.getSubcommand();

	// temporary
	if (intr.user.id !== intr.client.application.owner?.id) return intr.editReply({ content: "No" });

	const config = new ConfigManager(intr.client, intr.guild.id);

	switch (option) {
		case "member-log":
		case "bot-log":
			await configLogs({ intr, option, method, config });
			break;
	}
}
