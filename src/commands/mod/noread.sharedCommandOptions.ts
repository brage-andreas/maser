import {
	ApplicationCommandOptionType,
	type ApplicationCommandOptionData
} from "discord.js";

export const user = (required?: true): ApplicationCommandOptionData => ({
	name: "user",
	description: "The user to target",
	type: ApplicationCommandOptionType.User,
	required
});

export const reason = (
	action: string,
	required?: true
): ApplicationCommandOptionData => ({
	name: "reason",
	type: ApplicationCommandOptionType.String,
	description: `The reason for this ${action}`,
	required
});
