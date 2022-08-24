import { GatewayIntentBits, type APIEmbed } from "discord-api-types/v9";
import {
	Partials,
	type AutocompleteInteraction,
	type CommandInteraction,
	type UserFlagsString
} from "discord.js";
import { e } from "../emojis/index.js";
import { type Colour } from "../typings/index.js";

export const DEFAULT_LOGGER_TYPE = "LOG";
export const DEFAULT_LOGGER_TYPE_COLOUR: Colour = "yellow";
export const MAX_AUDIT_REASON_LEN = 512;
export const MAX_EMBED_DESCRIPTION_LEN = 4096;

export const INTENTS: Array<GatewayIntentBits> = [
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.Guilds
];

export const PARTIALS: Array<Partials> = [
	Partials.GuildMember //
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
	// CHANNEL: /^<#\d{17,19}>$/,
	// CODE: /`(?<code>.+?)`/,
	// CODEBLOCK: /```(?:(?<lang>\S+)\n)?\s?(?<code>[^]+?)\s?```/,
	// GUILD_EMOJI: /<?(a)?:?(\w{2,32}):(\d{17,19})>?/,
	ID: /^\d{17,19}$/,
	// INVITE: /(?:https?:\/\/)?(?:www\.)?discord(?:\.gg|(?:app)?\.com\/invite)\/(\S+)/,
	// ROLE: /^<@&\d{17,19}>$/,
	TOKEN: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/
	// USER: /^<@!?\d{17,19}>$/,
} as const;

export const COLORS = {
	black: 0x000000,
	blue: 0x5591ff,
	// blurple: 0x5865f2,
	green: 0x5ad658,
	invisible: 0x2f3136,
	orange: 0xff8741,
	red: 0xff5733,
	white: 0xffffff,
	yellow: 0xffc152
} as const;

export const USER_FLAGS_STRINGS: Record<UserFlagsString, string> = {
	BotHTTPInteractions: "🤖 HTTP-only bot",
	BugHunterLevel1: e`{bughunter1} Bughunter`,
	BugHunterLevel2: e`{bughunter} Bughunter Gold`,
	CertifiedModerator: e`{certifiedMod} Certified mod`,
	Hypesquad: e`{hypesquad} Hypesquad`,
	HypeSquadOnlineHouse1: e`{bravery} Bravery`,
	HypeSquadOnlineHouse2: e`{brilliance} Brilliance`,
	HypeSquadOnlineHouse3: e`{balance} Balance`,
	Partner: e`{partner} Partner`,
	PremiumEarlySupporter: e`{earlyNitro} Early Nitro`,
	Spammer: e`{warning} Spammer`,
	Staff: e`{staff} Discord staff`,
	TeamPseudoUser: "💼 Team user",
	VerifiedBot: "🤖 Verified bot",
	VerifiedDeveloper: e`{earlyDeveloper} Early verified dev`,
	Quarantined: e`{warning} Quarantined`
};

export const BOOST_LEVELS = {
	3: "boost level 3",
	2: "boost level 2",
	1: "boost level 1",
	0: "no boost level"
} as const;

export enum LoggerTypes {
	Command,
	Error,
	Event,
	Info
}

export function defaultEmbed(
	intr?:
		| AutocompleteInteraction<"cached">
		| CommandInteraction<"cached">
		| null
		| undefined
): APIEmbed {
	const options: APIEmbed = { color: COLORS.green };

	if (intr) {
		const iconURL = intr.member.displayAvatarURL();
		const name = `${intr.user.tag} (${intr.user.id})`;

		options.author = {
			icon_url: iconURL,
			name
		};
	}

	return options;
}
