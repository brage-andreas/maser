import type { ApplicationCommandData } from "discord.js";
import type { CmdIntr } from "../../Typings.js";

import { ApplicationCommandOptionType } from "discord-api-types";
import Discord from "discord.js";

export const data: ApplicationCommandData = {
	name: "eval",
	description: "Runs code",
	options: [
		{
			name: "code",
			description: "The code to run",
			type: ApplicationCommandOptionType.String as number,
			required: true
		},
		{
			name: "output",
			description: "To show the output or not",
			type: ApplicationCommandOptionType.Boolean as number
		},
		{
			name: "hide",
			description: "To hide the output or not",
			type: ApplicationCommandOptionType.Boolean as number
		}
	]
};

export async function execute(intr: CmdIntr) {
	const code = intr.options.getString("code", true);
	const output = intr.options.getBoolean("output") ?? true;
	const hide = intr.options.getBoolean("hide") ?? false;
}
