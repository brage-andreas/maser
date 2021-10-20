import type { ApplicationCommandData } from "discord.js";
import type { CommandInteraction, PartialCommand } from "../../typings.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const options = {
	wip: true
};

const data: ApplicationCommandData = {
	name: "mute",
	description: "Mutes a user for a given time",
	options: [
		{
			name: "user",
			type: ApplicationCommandOptionTypes.USER,
			description: "The user to mute",
			required: true
		},
		{
			name: "reason",
			type: ApplicationCommandOptionTypes.STRING,
			description: "The reason for this mute"
		},
		{
			name: "duration",
			type: ApplicationCommandOptionTypes.STRING,
			description: "The duration for this mute",
			choices: [
				{ name: "3 hours", value: "3hrs" },
				{ name: "15 minutes", value: "15min" },
				{ name: "45 minutes", value: "45min" },
				{ name: "1,5 hours", value: "1.5hrs" },
				{ name: "6 hours", value: "6hrs" },
				{ name: "12 hours", value: "12hrs" },
				{ name: "1 day", value: "1d" },
				{ name: "3 days", value: "3d" }
			]
		}
	]
};

async function execute(intr: CommandInteraction) {
	//

	intr.logger.log(`mute`);
}

export const getCommand = () => ({ options, data, execute } as PartialCommand);
