import type { CommandInteraction, ConfigColumns, Command } from "../../typings.js";
import type { ChatInputApplicationCommandData } from "discord.js";

import { CONFIG_OPTIONS, CONFIG_RESULT_KEYS } from "../../constants.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { MessageEmbed } from "../../modules/index.js";
import ConfigManager from "../../database/ConfigManager.js";
import methods from "./.methods.js";

const options = {
	private: true
};

const data: ChatInputApplicationCommandData = {
	name: "config",
	description: "Manages this server's config",
	options: [
		{
			name: "bot-log",
			description: "Options for this server's bot log channel",
			type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
			options: CONFIG_OPTIONS.CHANNEL
		},
		{
			name: "member-log",
			description: "Options for this server's member log channel",
			type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
			options: CONFIG_OPTIONS.CHANNEL
		},
		{
			name: "mod-log",
			description: "Options for this server's mod log channel",
			type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
			options: CONFIG_OPTIONS.CHANNEL
		},
		{
			name: "muted-role",
			description: "Options for this server's muted role",
			type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
			options: CONFIG_OPTIONS.ROLE
		},
		{
			name: "view-config",
			description: "Sends the full config",
			type: ApplicationCommandOptionTypes.SUB_COMMAND
		}
	]
};

async function execute(intr: CommandInteraction) {
	const option = intr.options.getSubcommandGroup(false);
	const method = intr.options.getSubcommand();

	const config = new ConfigManager(intr.client, intr.guild.id);

	if (method === "view-config") {
		const res = await config.getAll();

		const configEmbed = new MessageEmbed(intr).setTitle("Your config");

		for (let [key, value] of Object.entries(res)) {
			key = CONFIG_RESULT_KEYS[key as ConfigColumns];

			const guild = intr.client.guilds.cache.get(value)?.name ?? null;
			const channel = intr.guild.channels.cache.get(value)?.toString() ?? null;
			const role = intr.guild.roles.cache.get(value)?.toString() ?? null;

			const valueStr = guild ?? channel ?? role ?? `Couldn't find anything with id: ${value}`;

			configEmbed.addField(key, valueStr);
		}

		intr.editReply({ embeds: [configEmbed] });

		intr.logger.log("Sent full config");
	}

	switch (option) {
		case "member-log":
			config.setKey("memberLogChannel");
			await methods({ intr, option: CONFIG_RESULT_KEYS["memberLogChannel"], method, config });
			break;

		case "bot-log":
			config.setKey("botLogChannel");
			await methods({ intr, option: CONFIG_RESULT_KEYS["botLogChannel"], method, config });
			break;

		case "muted-role":
			config.setKey("mutedRole");
			await methods({ intr, option: CONFIG_RESULT_KEYS["mutedRole"], method, config });
			break;

		case "mod-log":
			config.setKey("modLogChannel");
			await methods({ intr, option: CONFIG_RESULT_KEYS["modLogChannel"], method, config });
			break;
	}
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
