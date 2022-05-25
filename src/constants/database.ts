import {
	ApplicationCommandOptionType,
	ChannelType,
	type ApplicationCommandSubCommandData
} from "discord.js";

export const CONFIG_COMMAND_CHANNEL_OPTIONS: Array<ApplicationCommandSubCommandData> =
	[
		{
			name: "view",
			description: "Sends the option's value",
			type: ApplicationCommandOptionType.Subcommand
		},
		{
			name: "set",
			description: "Sets a new value for the option",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "channel",
					description:
						"The new channel to set to. Omitting this option will remove its value",
					channelTypes: [
						ChannelType.GuildText,
						ChannelType.GuildNews
					],
					type: ApplicationCommandOptionType.Channel
				}
			]
		}
	];

export enum CaseTypes {
	Ban = 0,
	Kick = 1,
	Softban = 2,
	Timeout = 3,
	Warn = 4,
	Unban = 5,
	Untimeout = 6
}
