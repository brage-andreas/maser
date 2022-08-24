import createTag from "@drango/tag-functions";
import { type MaserEmojis } from "../typings/index.js";

const regExp =
	/{(?<emoji>(balance)|(booster)|(bravery)|(brilliance)|(bughunter1)|(bughunter2)|(certified_mod)|(check)|(cross)|(earlyDeveloper)|(earlyNitro)|(hypesquad)|(lock)|(partner)|(sparkles)|(staff)|(warning)|(wip))}/gi;

// Source in root/icons
export const EMOJIS: Record<MaserEmojis, string> = {
	balance: "<:discord_balance:938523381710602241>",
	booster: "<:discord_booster:938523381580595273>",
	bravery: "<:discord_bravery:938523381995798558>",
	brilliance: "<:discord_brilliance:938523381626728510>",
	bughunter1: "<:discord_bughunter_1:938523381756751924>",
	bughunter2: "<:discord_bughunter_2:938523382104879144>",
	certified_mod: "<:discord_certified_mod:938523382083895318>",
	check: "<:maser_check:924421206122328114>",
	cross: "<:maser_cross:924421206017474630>",
	earlyDeveloper: "<:discord_early_developer:938523382083895316>",
	earlyNitro: "<:discord_early_nitro:938523382029369394>",
	hypesquad: "<:discord_hypesquad:938523382004203550>",
	lock: "<:maser_lock:924421206046814208>",
	partner: "<:discord_partner:938523382020964452>",
	sparkles: "<:maser_sparkles:924421206143295517>",
	staff: "<:discord_staff:938523381983236106>",
	warning: "<:maser_warning:924421206105546822>",
	wip: "<:maser_wip:924421206004867132>"
} as const;

const eFn = (string: string): string =>
	string.replaceAll(
		regExp,
		(emoji) => EMOJIS[emoji.slice(1, -1) as MaserEmojis]
	);

/**
 * Function to parse emojis by replacing `{emoji}` with an emoji used in Discord.
 * @returns The string with parsed emojis.
 * @example
 * const myString = e`{check} done`;
 * console.log(myString) // "<:maser_check:924421206122328114> done"
 */
export const e = createTag(eFn);
