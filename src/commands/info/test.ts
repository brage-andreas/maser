import type { ApplicationCommandData } from "discord.js";
import type { CmdIntr } from "../../Typings";
import { ApplicationCommandOptionType } from "discord-api-types/v9";

export const data: ApplicationCommandData = {
	name: "test",
	description: "A test"
	/*options: [
		{
			name: "sub-group",
			description: "A subcommand group",
			type: ApplicationCommandOptionType.SubcommandGroup as number,
			options: [
				{
					name: "sub",
					description: "A subcommand",
					type: ApplicationCommandOptionType.Subcommand as number,
					options: [
						{
							name: "option",
							description: "An option",
							type: ApplicationCommandOptionType.String as number
						}
					]
				}
			]
		}
	]*/
};

export async function execute(intr: CmdIntr) {
	intr.editReply("i need help");

	intr.logger.log("i need help");
}
