import createTag from "@drango/tag-functions";
import { type MaserEmojis } from "../typings/index.js";

const regExp = /{(?<emoji>(check)|(cross)|(lock)|(warning)|(wip))}/gi;

// Source in root/icons
export const EMOJIS: Record<MaserEmojis, string> = {
	warning: "<:maser_warning:924421206105546822>",
	check: "<:maser_check:924421206122328114>",
	cross: "<:maser_cross:924421206017474630>",
	lock: "<:maser_lock:924421206046814208>",
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
