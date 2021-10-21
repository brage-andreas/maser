import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Intents, type ApplicationCommandSubCommandData } from "discord.js";

export const INTENTS = [
	Intents.FLAGS.GUILDS, //
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_MESSAGES // temporary until multi-line slashie
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

const BLURPLE = "5865F2";
const ORANGE = "FF8741";
const YELLOW = "FFC152";
const BLACK = "000000";
const GREEN = "5AD658";
const INVIS = "2F3136";
const WHITE = "FFFFFF";
const RED = "FF5733";
export const COLORS = {
	BLACK,
	BLURPLE,
	ORANGE,
	YELLOW,
	GREEN,
	INVIS,
	WHITE,
	RED
};

export const USER_FLAGS = {
	EARLY_VERIFIED_BOT_DEVELOPER: "early developer",
	DISCORD_CERTIFIED_MODERATOR: "certified mod",
	PARTNERED_SERVER_OWNER: "partnered",
	BUGHUNTER_LEVEL_1: "bughunter",
	BUGHUNTER_LEVEL_2: "bughunter²",
	DISCORD_EMPLOYEE: "discord employee",
	HYPESQUAD_EVENTS: "hypesquad events",
	HOUSE_BRILLIANCE: "brilliance",
	EARLY_SUPPORTER: "early supporter",
	HOUSE_BRAVERY: "bravery",
	HOUSE_BALANCE: "balance",
	VERIFIED_BOT: "verified bot",
	TEAM_USER: "team user"
};

export enum LOGGER_TYPES {
	COMMAND,
	ERROR,
	EVENT,
	INFO
}

export enum BOOST_LEVELS {
	TIER_3 = "boost level 3",
	TIER_2 = "boost level 2",
	TIER_1 = "boost level 1",
	NONE = "no boost level"
}

export enum CONFIG_RESULT_KEYS {
	id = "Guild",
	bot_log_channel_id = "Bot log channel",
	member_log_channel_id = "Member log channel",
	muted_role_id = "Muted role"
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

export default {
	INTENTS,
	MAX_EMBED_DESCRIPTION_LEN,
	REGEX,
	COLORS,
	USER_FLAGS,
	LOGGER_TYPES,
	BOOST_LEVELS,
	CONFIG_RESULT_KEYS,
	CONFIG_OPTIONS
};
