import type { ApplicationCommandData } from "discord.js";
import type { CmdIntr } from "../../Typings.js";

import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { evaluate } from "../../utils/Eval.js";
import Util from "../../utils/index.js";

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
			name: "reply",
			description: "Reply to the command. Default is true",
			type: ApplicationCommandOptionType.Boolean as number
		}
	]
};

export async function execute(intr: CmdIntr) {
	const code = intr.options.getString("code", true);
	const reply = intr.options.getBoolean("output") ?? true;

	if (intr.user.id !== intr.client.application!.owner!.id) return intr.reply({ content: "No", ephemeral: true });

	const { embeds, files, output } = await evaluate(intr, code);

	if (reply) {
		intr.editReply({ embeds, files });
	}

	intr.logger.log(`Code:\n${Util.Indent(code)}\nOutput:\n${Util.Indent(output)}`);
}
