import { type ChatInputApplicationCommandData, type CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { type Command, type CommandOptions } from "../../typings/index.js";

export const options: Partial<CommandOptions> = {
	private: true
};

const data: ChatInputApplicationCommandData = {
	name: "build",
	description: "Build commands",
	options: [
		{
			name: "global",
			description: "Build global commands",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: [
				{
					name: "clear",
					description: "Clear commands instead of building",
					type: ApplicationCommandOptionTypes.BOOLEAN
				}
			]
		},
		{
			name: "guild",
			description: "Build guild commands",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: [
				{
					name: "guild",
					description: "A specific guild to build to",
					type: ApplicationCommandOptionTypes.STRING
				},
				{
					name: "clear",
					description: "Clear commands instead of building",
					type: ApplicationCommandOptionTypes.BOOLEAN
				}
			]
		}
	]
};

async function execute(intr: CommandInteraction) {
	const type = intr.options.getSubcommand(true);
	const clear = intr.options.getBoolean("clear") ?? false;
	const guildId = intr.options.getString("guild") ?? intr.guildId;
	const clientId = intr.client.user.id;

	if (type === "guild") {
		const guild = intr.client.guilds.cache.get(guildId);
		if (!guild) {
			intr.editReply("I couldn't find the guild");
			return;
		}

		if (clear) {
			intr.client.commandHandler.clear(clientId, guildId);
		} else {
			intr.client.commandHandler.put(clientId, guildId);
		}

		intr.editReply(`${clear ? "Cleared" : "Put"} commands in guild: ${guild.name} (${guild.id})`);
		intr.logger.log(`${clear ? "Cleared" : "Put"} commands in guild: ${guild.name} (${guild.id})`);
	} else {
		if (clear) intr.client.commandHandler.clear(clientId);
		else intr.client.commandHandler.put(clientId);

		intr.editReply(`${clear ? "Cleared" : "Put"} global commands`);
		intr.logger.log(`${clear ? "Cleared" : "Put"} global commands`);
	}
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
