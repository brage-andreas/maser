import { Intents } from "discord.js";

export const INTENTS = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];

// * REGEXP
// export const INVITE_REGEX = /(?:https?:\/\/)?(?:www\.)?discord(?:\.gg|(?:app)?\.com\/invite)\/(\S+)/;
export const CODEBLOCK_REGEX = /```(?:(?<lang>\S+)\n)?\s?(?<code>[^]+?)\s?```/;
// export const GUILDEMOJI_REGEX = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
export const TOKEN_REGEX = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;
export const CODE_REGEX = /`(?<code>.+?)`/;

// export const CHANNEL_REGEX = /^<#\d{17,19}>$/;
// export const ROLE_REGEX = /^<@&\d{17,19}>$/;
export const USER_REGEX = /^<@!?\d{17,19}>$/;

export const ID_REGEX = /^\d{17,19}$/;
// *

// * COLORS
export const BLURPLE = "5865F2";
export const ORANGE = "FF8741";
export const YELLOW = "FFC152";
export const BLACK = "000000";
export const GREEN = "5AD658";
export const INVIS = "2F3136";
export const WHITE = "FFFFFF";
export const RED = "FF5733";

export const COLORS = { BLACK, BLURPLE, ORANGE, YELLOW, GREEN, INVIS, WHITE, RED };
// *

// * PHRASES
/*export const JOIN_PHRASES = [
	"Nice to see you, #!",
	"Much welcome, #!",
	"Good morning, #!",
	"What's up, #?",
	"Hello, #!",
	"Hiii, #!"
];*/
/*export const LEAVE_PHRASES = [
	"Hope too see you soon, #!",
	"Until next time, #!",
	"See you later, #!",
	"Farewell, #!",
	"Bye bye, #!",
	"Adiós, #!"
];*/
// *
