export type MaserEmojis =
	| "check"
	| "cross"
	| "lock"
	| "sparkles"
	| "warning"
	| "wip";

// Source of emojis are located in /icons
export const EMOJIS: Record<MaserEmojis | "boost", string> = {
	sparkles: "<:maser_sparkles:924421206143295517>",
	warning: "<:maser_warning:924421206105546822>",
	boost: "<:discord_booster:938523381580595273>",
	check: "<:maser_check:924421206122328114>",
	cross: "<:maser_cross:924421206017474630>",
	lock: "<:maser_lock:924421206046814208>",
	wip: "<:maser_wip:924421206004867132>"
} as const;
