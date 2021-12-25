import type { AutocompleteInteraction, CommandInteraction, MessageEmbedOptions, UserFlagsString } from "discord.js";
import { Intents } from "discord.js";

export const MAX_EMBED_DESCRIPTION_LEN = 4096;
export const MAX_AUDIT_REASON_LEN = 512;

export const INTENTS = [
	Intents.FLAGS.GUILD_MEMBERS, //
	Intents.FLAGS.GUILDS
];

export const DURATIONS = {
	FIFTEEN_MIN: 900000,
	FOURTY_FIVE_MIN: 2700000,

	ONE_AND_HALF_HRS: 129600000,
	THREE_HRS: 10800000,
	SIX_HRS: 21600000,
	TWELVE_HRS: 44200000,

	ONE_DAY: 86400000,
	THREE_DAYS: 259200000
} as const;

export const REGEXP = {
	/* GUILD_EMOJI: /<?(a)?:?(\w{2,32}):(\d{17,19})>?/, */
	CODEBLOCK: /```(?:(?<lang>\S+)\n)?\s?(?<code>[^]+?)\s?```/,
	CHANNEL: /^<#\d{17,19}>$/,
	/* INVITE: /(?:https?:\/\/)?(?:www\.)?discord(?:\.gg|(?:app)?\.com\/invite)\/(\S+)/, */
	TOKEN: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/,
	CODE: /`(?<code>.+?)`/,
	ROLE: /^<@&\d{17,19}>$/,
	USER: /^<@!?\d{17,19}>$/,
	ID: /^\d{17,19}$/
} as const;

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
	blue: "#5591FF",
	red: "#FF5733"
} as const;

export const USER_FLAGS: Record<UserFlagsString, string> = {
	EARLY_VERIFIED_BOT_DEVELOPER: "early developer",
	DISCORD_CERTIFIED_MODERATOR: "certified mod",
	PARTNERED_SERVER_OWNER: "partnered",
	BOT_HTTP_INTERACTIONS: "slash-only bot",
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

export enum LoggerTypes {
	Command,
	Error,
	Event,
	Info
}

export const BOOST_LEVELS = {
	TIER_3: "boost level 3",
	TIER_2: "boost level 2",
	TIER_1: "boost level 1",
	NONE: "no boost level"
};

export function defaultEmbedOptions(
	intr?: CommandInteraction<"cached"> | AutocompleteInteraction<"cached">
): MessageEmbedOptions {
	const options: MessageEmbedOptions = { color: COLORS.green };

	if (intr) {
		const iconURL = intr.member.displayAvatarURL();
		const name = `${intr.user.tag} (${intr.user.id})`;
		options.author = { iconURL, name };
	}

	return options;
}
