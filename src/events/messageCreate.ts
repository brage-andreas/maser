import type { Message } from "discord.js";
import type { Clint } from "../extensions/";

import { CODEBLOCK_REGEX, CODE_REGEX, ID_REGEX, USER_REGEX } from "../constants.js";
import { MessageAttachment, MessageButton } from "discord.js";
import { CommandLogger } from "../utils/logger/";
import { ButtonManager } from "../extensions/";
import evaluate from "../utils/eval.js";
import Util from "../utils/";

export async function execute(client: Clint, msg: Message) {
	if (msg.author.id !== client.application.owner?.id) return;
	if (["DM", "GROUP_DM"].includes(msg.channel.type) || !msg.guild || !msg.member) return;

	const split = msg.content.split(/\s+/g);
	const [mention, command] = split.splice(0, 2);
	if (!mention || !command) return;

	const argument = split[0];

	const isId = ID_REGEX.test(mention);
	const isMention = USER_REGEX.test(mention);
	const cleanId = mention.replaceAll(/\D/g, "");

	if (!(isId || isMention) && cleanId === client.user.id) return;

	// TODO: real system for build/clear
	if (command === "build") {
		if (!argument || !["client", "guild"].includes(argument.toLowerCase()))
			return msg.reply(`Unknown type: ${argument ?? "No type provided"}\nMust be one of "client", "guild"`);

		msg.delete().catch(() => null);
		const res = await client.commands.put(client.user.id, argument === "guild" ? msg.guild.id : undefined);
		if (!res) msg.reply("Something went wrong with setting the commands.");

		return;
	}

	// TODO: real system for build/clear
	if (command === "clear") {
		if (!argument || !["client", "guild"].includes(argument.toLowerCase()))
			return msg.reply(`Unknown type: ${argument ?? "No type provided"}\nMust be one of "client", "guild"`);

		msg.delete().catch(() => null);
		const res = await client.commands.clear(client.user.id, argument === "guild" ? msg.guild.id : undefined);
		if (!res) msg.reply("Something went wrong with clearing the commands.");

		return;
	}

	// Temporary eval until multi-line slashies
	if (command === "eval") {
		const logger = new CommandLogger() //
			.setChannel(msg.channel)
			.setUser(msg.author)
			.setGuild(msg.guild)
			.setName("MSG-EVAL");

		const captured = (msg.content.match(CODEBLOCK_REGEX) ?? msg.content.match(CODE_REGEX))?.groups;
		const code = captured?.code ?? split.join(" ");

		const { embeds, output, type } = await evaluate(code, msg);

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

		buttonManager.setRows(outputButton, codeButton);
		const reply = await msg.reply({ embeds, components: buttonManager.rows });

		const collector = buttonManager.setMessage(reply).setUser(msg.author).createCollector();

		collector.on("collect", (interaction) => {
			if (interaction.customId === "output") {
				const attachment = new MessageAttachment(Buffer.from(output), "output.txt");

				interaction.followUp({ files: [attachment] }).catch(() => {
					interaction.followUp({ content: "I couldn't send the output", ephemeral: true });
				});

				buttonManager.disable(interaction, "output");
			}

			if (interaction.customId === "code") {
				const attachment = new MessageAttachment(Buffer.from(code), "code.txt");

				interaction.followUp({ files: [attachment] }).catch(() => {
					interaction.followUp({ content: "I couldn't send the code", ephemeral: true });
				});

				buttonManager.disable(interaction, "code");
			}
		});

		collector.on("dispose", (intr) => {
			intr.reply({ content: "You cannot use this button", ephemeral: true });
		});

		logger.log(`Code:\n${Util.Indent(code, 4)}\nOutput:\n${Util.Indent(output, 4)}`);
	}
}
