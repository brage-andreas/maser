import {
	MessageEmbed,
	type AutocompleteInteraction,
	type CommandInteraction,
	type IntentsString,
	type MessageEmbedOptions,
	type PartialTypes,
	type UserFlagsString
} from "discord.js";

export const MAX_EMBED_DESCRIPTION_LEN = 4096;
export const MAX_AUDIT_REASON_LEN = 512;

export const INTENTS: IntentsString[] = [
	"GUILD_MEMBERS", //
	"GUILDS"
];

export const PARTIALS: PartialTypes[] = [
	"GUILD_MEMBER" //
];

export const DURATIONS = {
	FIFTEEN_MIN: 900_000,
	FOURTY_FIVE_MIN: 2_700_000,

	ONE_AND_HALF_HRS: 5_400_000,
	THREE_HRS: 10_800_000,
	SIX_HRS: 21_600_000,
	TWELVE_HRS: 43_200_000,

	ONE_DAY: 86_400_000,
	THREE_DAYS: 259_200_000,
	SEVEN_DAYS: 604_800_000
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

export const BOOST_LEVELS = {
	TIER_3: "boost level 3",
	TIER_2: "boost level 2",
	TIER_1: "boost level 1",
	NONE: "no boost level"
};

export enum LoggerTypes {
	Command,
	Error,
	Event,
	Info
}

export function newDefaultEmbed(
	intr?: AutocompleteInteraction<"cached"> | CommandInteraction<"cached"> | null | undefined
): MessageEmbed {
	const options: MessageEmbedOptions = { color: COLORS.green };

	if (intr) {
		const iconURL = intr.member.displayAvatarURL();
		const name = `${intr.user.tag} (${intr.user.id})`;

		options.author = { iconURL, name };
	}

	return new MessageEmbed(options);
}
