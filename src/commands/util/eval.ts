import type { ApplicationCommandData, Message } from "discord.js";
import type { CommandInteraction, PartialCommand } from "../../typings.js";

import { MessageAttachment, MessageButton } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { ButtonManager } from "../../extensions/";
import evaluate from "../../utils/eval.js";
import Util from "../../utils/";

const options = {
	logLevel: 2,
	private: true
};

const data: ApplicationCommandData = {
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

async function execute(intr: CommandInteraction) {
	const code = intr.options.getString("code", true);
	const reply = intr.options.getBoolean("reply") ?? true;

	const [errorEm, successEm, inputEm] = intr.client.moji.find("exclamation", "success", "input");

	const { embeds, output, type } = await evaluate(code, intr);

	if (reply) {
		const buttonManager = new ButtonManager();

		const outputButton = new MessageButton() //
			.setLabel(`Full ${type}`)
			.setCustomId("output")
			.setStyle("SECONDARY")
			.setEmoji((type === "error" ? errorEm : successEm) ?? "📤");

		const codeButton = new MessageButton() //
			.setLabel("Full input")
			.setCustomId("code")
			.setStyle("SECONDARY")
			.setEmoji(inputEm ?? "📥");

		buttonManager.setRows(outputButton, codeButton).setUser(intr.user);

		const msg = (await intr.editReply({ embeds, components: buttonManager.rows })) as Message;
		const collector = buttonManager.setMessage(msg).createCollector();

		collector.on("collect", (interaction) => {
			if (interaction.customId === "output") {
				const attachment = new MessageAttachment(Buffer.from(output), "output.txt");

				interaction.followUp({ files: [attachment] });

				buttonManager.disable(interaction, "output");
				intr.logger.log(`Sent output as an attachment:\n${Util.indent(output)}`);
			}
			//
			else if (interaction.customId === "code") {
				const attachment = new MessageAttachment(Buffer.from(code), "code.txt");

				interaction.followUp({ files: [attachment] });

				buttonManager.disable(interaction, "code");
				intr.logger.log(`Sent code as an attachment:\n${Util.indent(code)}`);
			}
		});
	}

	intr.logger.log(`Code:\n${Util.indent(code, 4)}`, `Output:\n${Util.indent(output, 4)}`);
}

export const getCommand = () => ({ options, data, execute } as PartialCommand);
