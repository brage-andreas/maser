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

/*
  * None
 None = 0,
  * Discord Employee
 Staff = 1,
  * Partnered Server Owner
 Partner = 2,
  * HypeSquad Events Coordinator
 Hypesquad = 4,
  * Bug Hunter Level 1
 BugHunterLevel1 = 8,
  * House Bravery Member
 HypeSquadOnlineHouse1 = 64,
  * House Brilliance Member
 HypeSquadOnlineHouse2 = 128,
  * House Balance Member
 HypeSquadOnlineHouse3 = 256,
  * Early Nitro Supporter
 PremiumEarlySupporter = 512,
  * User is a [team](https://discord.com/developers/docs/topics/teams)
 TeamPseudoUser = 1024,
  * Bug Hunter Level 2
 BugHunterLevel2 = 16384,
  * Verified Bot
 VerifiedBot = 65536,
  * Early Verified Bot Developer
 VerifiedDeveloper = 131072,
  * Discord Certified Moderator
 CertifiedModerator = 262144,
  * Bot uses only [HTTP interactions](https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction) and is shown in the online member list
 BotHTTPInteractions = 524288
*/

export const USER_FLAGS: Record<UserFlagsString, string> = {
	HypeSquadOnlineHouse3: "balance",
	HypeSquadOnlineHouse2: "brilliance",
	HypeSquadOnlineHouse1: "bravery",
	PremiumEarlySupporter: "early nitro supporter",
	BotHTTPInteractions: "",
	CertifiedModerator: "",
	VerifiedDeveloper: "",
	BugHunterLevel2: "",
	BugHunterLevel1: "",
	TeamPseudoUser: "",
	VerifiedBot: "",
	Hypesquad: "",
	Partner: "",
	Staff: "",
	None: ""
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
