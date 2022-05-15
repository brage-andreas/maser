export type MaserEmojis = "check" | "cross" | "lock" | "warning" | "wip";

// Source in root/icons
export const EMOJIS: Record<MaserEmojis, string> = {
	warning: "<:maser_warning:924421206105546822>",
	check: "<:maser_check:924421206122328114>",
	cross: "<:maser_cross:924421206017474630>",
	lock: "<:maser_lock:924421206046814208>",
	wip: "<:maser_wip:924421206004867132>"
} as const;
