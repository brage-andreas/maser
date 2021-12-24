import { type ChatInputApplicationCommandData, type CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CONFIG_COMMAND_KEYS, CONFIG_OPTIONS, CONFIG_RESULT_KEYS } from "../../constants.js";
import ConfigManager from "../../database/ConfigManager.js";
import { type Command, type CommandOptions, type ConfigColumns } from "../../typings/index.js";
import methods from "./noread.methods.js";

const options: Partial<CommandOptions> = {
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
			name: "view-config",
			description: "Sends the full config",
			type: ApplicationCommandOptionTypes.SUB_COMMAND
		}
	]
};

async function execute(intr: CommandInteraction<"cached">) {
	const option = intr.options.getSubcommandGroup(false);
	const method = intr.options.getSubcommand();

	const config = new ConfigManager(intr.client, intr.guild.id);
	const { emFileGreen } = intr.client.systemEmojis;

	if (method === "view-config") {
		const res = await config.getAllValues();

		let response = `${emFileGreen} Config for **${intr.guild.name}** (${intr.guildId})\n`;

		for (let [key, value] of Object.entries(res)) {
			key = CONFIG_RESULT_KEYS[key as ConfigColumns];

			const channel = intr.guild.channels.cache.get(value)?.toString() ?? null;
			const guild = intr.client.guilds.cache.get(value)?.name ?? null;
			const role = intr.guild.roles.cache.get(value)?.toString() ?? null;

			const mention = channel ?? guild ?? role;
			const mentionString = mention ? `${mention} (${value})` : `Couldn't find anything with ID: ${value}`;

			response += `\n• **${key}**: ${value ? mentionString : "Not set"}`;
		}

		intr.editReply(response);

		intr.logger.log("Sent full config");
	}

	if (!option) return; // should be unnecessary, but TS yells at me

	config.setKey(CONFIG_COMMAND_KEYS[option].value);
	await methods({ intr, option: CONFIG_COMMAND_KEYS[option], method, config });
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
