// This is not a command

import { ApplicationCommandOptionType, type ApplicationCommandOptionData } from "discord.js";
import { DURATIONS } from "../../constants/index.js";

export const USER = (required?: true): ApplicationCommandOptionData => ({
	name: "user",
	description: "The user to target",
	type: ApplicationCommandOptionType.User,
	required
});

export const REASON = (action: string, required?: true): ApplicationCommandOptionData => ({
	name: "reason",
	type: ApplicationCommandOptionType.String,
	description: `The reason for this ${action}`,
	required
});

export const DURATION = (action: string, required?: true): ApplicationCommandOptionData => ({
	name: "duration",
	type: ApplicationCommandOptionType.Integer,
	description: `The duration for this ${action} (3 hours)`,
	required,
	choices: [
		{ name: "3 hours (default)", value: DURATIONS.THREE_HRS },
		{ name: "15 minutes", value: DURATIONS.FIFTEEN_MIN },
		{ name: "45 minutes", value: DURATIONS.FOURTY_FIVE_MIN },
		{ name: "1,5 hours", value: DURATIONS.ONE_AND_HALF_HRS },
		{ name: "6 hours", value: DURATIONS.SIX_HRS },
		{ name: "12 hours", value: DURATIONS.TWELVE_HRS },
		{ name: "1 day", value: DURATIONS.ONE_DAY },
		{ name: "3 days", value: DURATIONS.THREE_DAYS },
		{ name: "7 days", value: DURATIONS.THREE_DAYS }
	]
});
