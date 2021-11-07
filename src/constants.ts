import type { ApplicationCommandSubCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Intents } from "discord.js";

export const INTENTS = [
	Intents.FLAGS.GUILDS, //
	Intents.FLAGS.GUILD_MEMBERS
];

export const MAX_EMBED_DESCRIPTION_LEN = 4096;

// const GUILD_EMOJI_REGEX = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
const CODEBLOCK_REGEX = /```(?:(?<lang>\S+)\n)?\s?(?<code>[^]+?)\s?```/;
const CHANNEL_REGEX = /^<#\d{17,19}>$/;
// const INVITE_REGEX = /(?:https?:\/\/)?(?:www\.)?discord(?:\.gg|(?:app)?\.com\/invite)\/(\S+)/;
const TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;
const CODE_REGEX = /`(?<code>.+?)`/;
const ROLE_REGEX = /^<@&\d{17,19}>$/;
const USER_REGEX = /^<@!?\d{17,19}>$/;
const ID_REGEX = /^\d{17,19}$/;
export const REGEX = {
	//GUILD_EMOJI: GUILD_EMOJI_REGEX,
	CODEBLOCK: CODEBLOCK_REGEX,
	CHANNEL: CHANNEL_REGEX,
	//INVITE: INVITE_REGEX,
	TOKEN: TOKEN_REGEX,
	CODE: CODE_REGEX,
	ROLE: ROLE_REGEX,
	USER: USER_REGEX,
	ID: ID_REGEX
};

// Source of emojis are located in root/resources/icons
export const EMOJIS = {
	emUserRemoved: "<:user_removed:903948599048667216>",
	emEmptyFile: "<:empty_file:903948597790388244>",
	emFileGreen: "<:file:903948597832318986>",
	emCheckMark: "<:check_mark:903948598155309096>",
	emUserLock: "<:user_lock:903948598448893972>",
	emUnlocked: "<:unlocked:903948598532767775>",
	emFileRed: "<:file:903948598348222465>",
	emIdGreen: "<:id:903948599136763904>",
	emChannel: "<:channel:903948598306291712>",
	emSuccess: "<:success:903948598834782249>",
	emLocked: "<:locked:903948598318874655>",
	emError: "<:exclamation:903948598562144296>",
	emIdRed: "<:id:903948598427930654>",
	emXMark: "<:x_mark:903948598302093332>",
	emCrown: "<:crown:903948598834782250>",
	emInput: "<:input:903948598356623360>",
	emBug: "<:bug:903948597182218321>",
	emURL: "<:url:903948599556186112>",
	emWIP: "<:wip:903948598453076018>",
	emAt: "<:at:903948597551329300>"
} as const;

export const COLORS = {
	invisible: "#2F3136",
	blurple: "#5865F2",
	orange: "#FF8741",
	yellow: "#FFC152",
	black: "#000000",
	green: "#5AD658",
	white: "#FFFFFF",
	red: "#FF5733"
} as const;

export enum USER_FLAGS {
	EARLY_VERIFIED_BOT_DEVELOPER = "early developer",
	DISCORD_CERTIFIED_MODERATOR = "certified mod",
	PARTNERED_SERVER_OWNER = "partnered",
	BUGHUNTER_LEVEL_1 = "bughunter",
	BUGHUNTER_LEVEL_2 = "bughunter²",
	DISCORD_EMPLOYEE = "discord employee",
	HYPESQUAD_EVENTS = "hypesquad events",
	HOUSE_BRILLIANCE = "brilliance",
	EARLY_SUPPORTER = "early supporter",
	HOUSE_BRAVERY = "bravery",
	HOUSE_BALANCE = "balance",
	VERIFIED_BOT = "verified bot",
	TEAM_USER = "team user"
}

export enum LOGGER_TYPES {
	Command,
	Error,
	Event,
	Info
}

export enum BOOST_LEVELS {
	TIER_3 = "boost level 3",
	TIER_2 = "boost level 2",
	TIER_1 = "boost level 1",
	NONE = "no boost level"
}

export enum CONFIG_RESULT_KEYS {
	guildId = "Guild",
	botLogChannel = "Bot log channel",
	memberLogChannel = "Member log channel",
	mutedRole = "Muted role"
}

const CONFIG_CHANNEL_OPTIONS: ApplicationCommandSubCommandData[] = [
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

const CONFIG_ROLE_OPTIONS: ApplicationCommandSubCommandData[] = [
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
];

export const CONFIG_OPTIONS = {
	CHANNEL: CONFIG_CHANNEL_OPTIONS,
	ROLE: CONFIG_ROLE_OPTIONS
};

export enum INSTANCE_TYPES {
	Ban = 0,
	Kick = 1,
	Softban = 2,
	Mute = 3,
	Warn = 4
}

export default {
	INTENTS,
	MAX_EMBED_DESCRIPTION_LEN,
	REGEX,
	COLORS,
	USER_FLAGS,
	LOGGER_TYPES,
	BOOST_LEVELS,
	CONFIG_RESULT_KEYS,
	CONFIG_OPTIONS,
	INSTANCE_TYPES
};
