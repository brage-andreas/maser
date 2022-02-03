import { ApplicationCommandOptionType, ChannelType, type ApplicationCommandSubCommandData } from "discord.js";
import type { ConfigTableColumns } from "../typings/database.js";

/*
   --------
    CONFIG
   --------
*/

export const CONFIG_COLUMN_STRINGS: Record<ConfigTableColumns | string, string> = {
	memberLogChannel: "Member log channel",
	botLogChannel: "Bot log channel",
	modLogChannel: "Mod log channel",
	guildId: "Guild"
};

export const CONFIG_COMMAND_TO_COLUMN: Record<string, ConfigTableColumns> = {
	"member-log": "memberLogChannel",
	"bot-log": "botLogChannel",
	"mod-log": "modLogChannel"
};

const CONFIG_COMMAND_CHANNEL_OPTIONS: ApplicationCommandSubCommandData[] = [
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
				description: "The new channel to set to. Omitting this option will remove its value",
				channelTypes: [ChannelType.GuildText, ChannelType.GuildNews],
				type: ApplicationCommandOptionType.Channel
			}
		]
	}
];

/* const CONFIG_ROLE_OPTIONS: ApplicationCommandSubCommandData[] = [
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
				name: "role",
				description: "The new role to set to. Omitting this option will remove its value",
				type: ApplicationCommandOptionType.Role
			}
		]
	}
]; */

export const CONFIG_COMMAND_OPTIONS = {
	CHANNEL: CONFIG_COMMAND_CHANNEL_OPTIONS
	// ROLE: CONFIG_ROLE_OPTIONS
};

/*
   -------
    CASES
   -------
*/

export enum CaseTypes {
	Ban = 0,
	Kick = 1,
	Softban = 2,
	Timeout = 3,
	Warn = 4,
	Unban = 5,
	Untimeout = 6
}
