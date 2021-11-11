import type { ApplicationCommandOptionData, ApplicationCommandSubCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Intents } from "discord.js";

export const INTENTS = [
	Intents.FLAGS.GUILDS, //
	Intents.FLAGS.GUILD_MEMBERS
];

const ONE_AND_HALF_HRS = 129600000;
const FOURTY_FIVE_MIN = 2700000;
const FIFTEEN_MIN = 900000;
const THREE_DAYS = 259200000;
const TWELVE_HRS = 44200000;
const THREE_HRS = 10800000;
const ONE_DAY = 86400000;
const SIX_HRS = 21600000;
export const DURATIONS = {
	ONE_AND_HALF_HRS,
	FOURTY_FIVE_MIN,
	FIFTEEN_MIN,
	THREE_DAYS,
	TWELVE_HRS,
	THREE_HRS,
	ONE_DAY,
	SIX_HRS
};

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

export const BASE_MOD_CMD_OPTS = {
	REASON: (action: string): ApplicationCommandOptionData => ({
		name: "reason",
		type: ApplicationCommandOptionTypes.STRING,
		description: `The reason for this ${action}`
	}),
	DURATION: (action: string): ApplicationCommandOptionData => ({
		name: "duration",
		type: ApplicationCommandOptionTypes.INTEGER,
		description: `The duration for this ${action}`,
		choices: [
			{ name: "3 hours (default)", value: THREE_HRS },
			{ name: "15 minutes", value: FIFTEEN_MIN },
			{ name: "45 minutes", value: FOURTY_FIVE_MIN },
			{ name: "1,5 hours", value: ONE_AND_HALF_HRS },
			{ name: "6 hours", value: SIX_HRS },
			{ name: "12 hours", value: TWELVE_HRS },
			{ name: "1 day", value: ONE_DAY },
			{ name: "3 days", value: THREE_DAYS }
		]
	})
};

export default {
	MAX_EMBED_DESCRIPTION_LEN,
	CONFIG_RESULT_KEYS,
	BASE_MOD_CMD_OPTS,
	INSTANCE_TYPES,
	CONFIG_OPTIONS,
	LOGGER_TYPES,
	BOOST_LEVELS,
	USER_FLAGS,
	INTENTS,
	COLORS,
	REGEX
};
