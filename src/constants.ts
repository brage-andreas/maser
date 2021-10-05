import { Intents } from "discord.js";

export const INTENTS = [
	Intents.FLAGS.GUILDS, //
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_MESSAGES // temporary
];

export const MAX_EMBED_DESCRIPTION_LEN = 4096;

// export const GUILDEMOJI_REGEX = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
// export const INVITE_REGEX = /(?:https?:\/\/)?(?:www\.)?discord(?:\.gg|(?:app)?\.com\/invite)\/(\S+)/;
export const CODEBLOCK_REGEX = /```(?:(?<lang>\S+)\n)?\s?(?<code>[^]+?)\s?```/;
export const CHANNEL_REGEX = /^<#\d{17,19}>$/;
export const TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;
export const CODE_REGEX = /`(?<code>.+?)`/;
export const ROLE_REGEX = /^<@&\d{17,19}>$/;
export const USER_REGEX = /^<@!?\d{17,19}>$/;
export const ID_REGEX = /^\d{17,19}$/;

export const BLURPLE = "5865F2";
export const ORANGE = "FF8741";
export const YELLOW = "FFC152";
export const BLACK = "000000";
export const GREEN = "5AD658";
export const INVIS = "2F3136";
export const WHITE = "FFFFFF";
export const RED = "FF5733";
export const COLORS = { BLACK, BLURPLE, ORANGE, YELLOW, GREEN, INVIS, WHITE, RED };

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

export enum CONFIG_OPTIONS {
	BOT_LOG,
	MEMBER_LOG,
	ROLES
}

export enum BOOST_LEVELS {
	TIER_3 = "level 3",
	TIER_2 = "level 2",
	TIER_1 = "level 1",
	NONE = "no level"
}
