import type { Message } from "discord.js";
import type { Client } from "../extensions/";

import { REGEX } from "../constants.js";
import { MessageAttachment, MessageButton } from "discord.js";
import { CommandLogger } from "../utils/logger/";
import { ButtonManager } from "../extensions/";
import evaluate from "../utils/eval.js";
import Util from "../utils/";

export async function execute(client: Client, msg: Message) {
	if (msg.author.id !== client.application.owner?.id) return;
	if (["DM", "GROUP_DM"].includes(msg.channel.type) || !msg.guild || !msg.member) return;

	const [errorEm, successEm, inputEm] = client.moji.find("exclamation", "success", "input");

	const split = msg.content.split(/\s+/g);
	const [mention, command] = split.splice(0, 2);
	if (!mention || !command) return;

	const isId = REGEX.ID.test(mention);
	const isMention = REGEX.USER.test(mention);
	const cleanId = mention.replaceAll(/\D/g, "");

	if (!(isId || isMention) && cleanId === client.user.id) return;

	// Temporary eval until multi-line slashies
	if (command === "eval") {
		const logger = new CommandLogger() //
			.setChannel(msg.channel)
			.setUser(msg.author)
			.setGuild(msg.guild)
			.setName("MSG-EVAL");

		const captured = (msg.content.match(REGEX.CODEBLOCK) ?? msg.content.match(REGEX.CODE))?.groups;
		const code = captured?.code ?? split.join(" ");

		const { embeds, output, type } = await evaluate(code, msg);

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

		buttonManager.setRows(outputButton, codeButton);
		const reply = await msg.reply({ embeds, components: buttonManager.rows }).catch(() => null);
		if (!reply) return;

		const collector = buttonManager.setMessage(reply).setUser(msg.author).createCollector();

		collector.on("collect", (interaction) => {
			if (interaction.customId === "output") {
				const attachment = new MessageAttachment(Buffer.from(output), "output.txt");
				interaction.followUp({ files: [attachment] });

				buttonManager.disable(interaction, "output");
			}
			//
			else if (interaction.customId === "code") {
				const attachment = new MessageAttachment(Buffer.from(code), "code.txt");
				interaction.followUp({ files: [attachment] });

				buttonManager.disable(interaction, "code");
			}
		});

		logger.log(`Code:\n${Util.indent(code, 4)}\nOutput:\n${Util.indent(output, 4)}`);
	}
}
