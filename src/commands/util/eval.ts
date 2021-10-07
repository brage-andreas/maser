import type { ApplicationCommandData, Message } from "discord.js";
import type { CommandInteraction } from "../../typings.js";

import { MessageAttachment, MessageButton } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { ButtonManager } from "../../extensions/";
import evaluate from "../../utils/eval.js";
import Util from "../../utils/";

export const priv = true;
export const log = true;
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

export async function execute(intr: CommandInteraction) {
	const code = intr.options.getString("code", true);
	const reply = intr.options.getBoolean("reply") ?? true;

	const { embeds, output, type } = await evaluate(code, intr);

	if (reply) {
		const buttonManager = new ButtonManager();

		const outputButton = new MessageButton() //
			.setLabel(`Full ${type}`)
			.setCustomId("output")
			.setStyle("PRIMARY")
			.setEmoji("📤");

		const codeButton = new MessageButton() //
			.setLabel("Full input")
			.setCustomId("code")
			.setStyle("PRIMARY")
			.setEmoji("📥");

		buttonManager.setRows(outputButton, codeButton).setUser(intr.user);

		const msg = (await intr.editReply({ embeds, components: buttonManager.rows })) as Message;
		const collector = buttonManager.setMessage(msg).createCollector();

		collector.on("collect", (interaction) => {
			if (interaction.customId === "output") {
				const attachment = new MessageAttachment(Buffer.from(output), "output.txt");

				interaction.followUp({ files: [attachment] }).catch(() => {
					interaction.followUp({ content: "I couldn't send the output", ephemeral: true });
				});

				buttonManager.disable(interaction, "output");
				intr.logger.log(`Sent output as an attachment:\n${Util.indent(output)}`);
			}

			if (interaction.customId === "code") {
				const attachment = new MessageAttachment(Buffer.from(code), "code.txt");

				interaction.followUp({ files: [attachment] }).catch(() => {
					interaction.followUp({ content: "I couldn't send the code", ephemeral: true });
				});

				buttonManager.disable(interaction, "code");
				intr.logger.log(`Sent code as an attachment:\n${Util.indent(code)}`);
			}
		});

		collector.on("dispose", (intr) => {
			// this doesn't seem to actually work :shrug:
			intr.reply({ content: "You cannot use this button", ephemeral: true });
		});
	}

	intr.logger.log(`Code:\n${Util.indent(code, 4)}`, `Output:\n${Util.indent(output, 4)}`);
}
