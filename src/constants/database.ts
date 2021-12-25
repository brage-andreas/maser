import { ApplicationCommandSubCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ConfigTableColumns } from "../typings/database.js";

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
		type: ApplicationCommandOptionTypes.SUB_COMMAND
	},
	{
		name: "set",
		description: "Sets a new value for the option",
		type: ApplicationCommandOptionTypes.SUB_COMMAND,
		options: [
			{
				name: "channel",
				description: "The new channel to set to. Omitting this option will remove its value",
				channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
				type: ApplicationCommandOptionTypes.CHANNEL
			}
		]
	}
];

/* const CONFIG_ROLE_OPTIONS: ApplicationCommandSubCommandData[] = [
	{
		name: "view",
		description: "Sends the option's value",
		type: ApplicationCommandOptionTypes.SUB_COMMAND
	},
	{
		name: "set",
		description: "Sets a new value for the option",
		type: ApplicationCommandOptionTypes.SUB_COMMAND,
		options: [
			{
				name: "role",
				description: "The new role to set to. Omitting this option will remove its value",
				type: ApplicationCommandOptionTypes.ROLE
			}
		]
	}
]; */

export const CONFIG_COMMAND_OPTIONS = {
	CHANNEL: CONFIG_COMMAND_CHANNEL_OPTIONS
	// ROLE: CONFIG_ROLE_OPTIONS
};

/*
   ----------
    INSTANCE
   ----------
*/

export enum InstanceTypes {
	Ban = 0,
	Kick = 1,
	Softban = 2,
	Mute = 3,
	Warn = 4,
	Unban = 5
}
