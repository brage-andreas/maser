import { type APIEmbed, type GatewayIntentBits } from "discord-api-types";
import {
	Embed,
	IntentsBitField,
	Partials,
	type AutocompleteInteraction,
	type CommandInteraction,
	type UserFlagsString
} from "discord.js";

export const MAX_EMBED_DESCRIPTION_LEN = 4096;
export const MAX_AUDIT_REASON_LEN = 512;

export const INTENTS: GatewayIntentBits[] = [
	IntentsBitField.Flags.GuildMembers, //
	IntentsBitField.Flags.Guilds
];

export const PARTIALS: Partials[] = [
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
	invisible: 0x2f3136,
	blurple: 0x5865f2,
	orange: 0xff8741,
	yellow: 0xffc152,
	black: 0x000000,
	green: 0x5ad658,
	white: 0xffffff,
	blue: 0x5591ff,
	red: 0xff5733
} as const;

export const USER_FLAGS_STRINGS: Record<UserFlagsString, string> = {
	None: "None",
	Staff: "<:discord_staff:938523381983236106> Discord staff",
	Partner: "<:discord_partner:938523382020964452> Partner",
	Hypesquad: "<:discord_hypesquad:938523382004203550> Hypesquad",
	BugHunterLevel1: "<:discord_bughunter_1:938523381756751924> Bughunter",
	HypeSquadOnlineHouse1: "<:discord_bravery:938523381995798558> Bravery",
	HypeSquadOnlineHouse2: "<:discord_brilliance:938523381626728510> Brilliance",
	HypeSquadOnlineHouse3: "<:discord_balance:938523381710602241> Balance",
	PremiumEarlySupporter: "<:discord_early_nitro:938523382029369394> Early Nitro",
	TeamPseudoUser: "Team user",
	BugHunterLevel2: "<:discord_bughunter_2:938523382104879144> Bughunter but better",
	VerifiedBot: "Verified bot",
	VerifiedDeveloper: "<:discord_early_developer:938523382083895316> Early verified dev",
	CertifiedModerator: "<:discord_certified_mod:938523382083895318> Certified mod",
	BotHTTPInteractions: "HTTP-only bot"
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
): Embed {
	const options: APIEmbed = { color: COLORS.green };

	if (intr) {
		const iconURL = intr.member.displayAvatarURL();
		const name = `${intr.user.tag} (${intr.user.id})`;

		options.author = { icon_url: iconURL, name };
	}

	return new Embed(options);
}
