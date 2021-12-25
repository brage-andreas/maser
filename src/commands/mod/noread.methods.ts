// This is not a command

import { ApplicationCommandOptionData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { DURATIONS } from "../../constants/index.js";

export const USER = (required?: true): ApplicationCommandOptionData => ({
	name: "user",
	description: "The user to target",
	type: ApplicationCommandOptionTypes.USER,
	required
});

export const REASON = (action: string, required?: true): ApplicationCommandOptionData => ({
	name: "reason",
	type: ApplicationCommandOptionTypes.STRING,
	description: `The reason for this ${action}`,
	required
});

export const DURATION = (action: string, required?: true): ApplicationCommandOptionData => ({
	name: "duration",
	type: ApplicationCommandOptionTypes.INTEGER,
	description: `The duration for this ${action}`,
	required,
	choices: [
		{ name: "3 hours (default)", value: DURATIONS.THREE_HRS },
		{ name: "15 minutes", value: DURATIONS.FIFTEEN_MIN },
		{ name: "45 minutes", value: DURATIONS.FOURTY_FIVE_MIN },
		{ name: "1,5 hours", value: DURATIONS.ONE_AND_HALF_HRS },
		{ name: "6 hours", value: DURATIONS.SIX_HRS },
		{ name: "12 hours", value: DURATIONS.TWELVE_HRS },
		{ name: "1 day", value: DURATIONS.ONE_DAY },
		{ name: "3 days", value: DURATIONS.THREE_DAYS }
	]
});
