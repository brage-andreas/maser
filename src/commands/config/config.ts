import {
	ApplicationCommandOptionType,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import {
	CONFIG_COLUMN_STRINGS,
	CONFIG_COMMAND_OPTIONS,
	CONFIG_COMMAND_TO_COLUMN
} from "../../constants/database.js";
import ConfigManager from "../../database/ConfigManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";

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
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: CONFIG_COMMAND_OPTIONS.CHANNEL
		},
		{
			name: "member-log",
			description: "Options for this server's member log channel",
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: CONFIG_COMMAND_OPTIONS.CHANNEL
		},
		{
			name: "mod-log",
			description: "Options for this server's mod log channel",
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: CONFIG_COMMAND_OPTIONS.CHANNEL
		},
		{
			name: "view-config",
			description: "Sends the full config",
			type: ApplicationCommandOptionType.Subcommand
		}
	]
};

async function execute(intr: ChatInputCommandInteraction<"cached">) {
	const rawOption = intr.options.getSubcommandGroup(false);
	const method = intr.options.getSubcommand();
	const config = new ConfigManager(intr.client, intr.guild.id);
	const emojis = intr.client.maserEmojis;

	if (method === "view-config") {
		const res = await config.getAllValues();

		const response = [
			`Config for **${intr.guild.name}** (${intr.guildId})\n`
		];

		Object.entries(res).forEach(([key, value]) => {
			if (key === "id") return;

			const keyStr = CONFIG_COLUMN_STRINGS[key];

			const channel =
				intr.guild.channels.cache.get(value)?.toString() ?? null;

			// const role = intr.guild.roles.cache.get(value)?.toString() ?? null;
			const mention = channel; //?? role;

			// eslint-disable-next-line padding-line-between-statements
			const mentionString = mention
				? `${mention} (${value})`
				: `Couldn't find anything with ID of \`${value}\``;

			response.push(
				`• **${keyStr}**: ${value ? mentionString : "*Not set*"}`
			);
		});

		intr.editReply(response.join("\n"));

		intr.logger.log("Sent full config");
	}

	const option = CONFIG_COMMAND_TO_COLUMN[rawOption ?? ""];

	config.setKey(option);

	switch (method) {
		case "view": {
			const channel = await config.getChannel();
			// const role = await config.getRole();
			const optionStr = CONFIG_COLUMN_STRINGS[option];
			let response = `Config for **${intr.guild.name}** (${intr.guildId})\n\n• **${optionStr}**: `;

			if (channel) response += channel.toString();
			// else if (role) response += role.toString();
			else response += "Not set";

			intr.editReply(response);

			intr.logger.log(
				`Used method VIEW on option ${option}: ${
					/*(channel?? role)?.id*/ channel?.id ?? "No value"
				}`
			);

			break;
		}

		case "set": {
			const res =
				intr.options.getChannel(
					"channel"
				); /* ?? intr.options.getRole("role"); */

			const old = await config.getAllValues();
			const value = res?.id ?? "NULL";

			await config.set(value);

			old[option] = res?.id;

			let response = `${emojis.check} Updated config for **${intr.guild.name}** (${intr.guildId})\n`;

			for (const [key, value] of Object.entries(old)) {
				const keyStr = CONFIG_COLUMN_STRINGS[key];

				const channel =
					intr.guild.channels.cache.get(value)?.toString() ?? null;

				const guild = intr.client.guilds.cache.get(value)?.name ?? null;
				// const role = intr.guild.roles.cache.get(value)?.toString() ?? null;
				const mention = channel ?? guild; /* ?? role; */

				if (key === option) {
					let valueString = `\n• **${keyStr}**: `;

					if (mention && res)
						valueString += `${mention} (${res.id}) **(updated)**`;
					else if (res)
						valueString += `Couldn't find anything with ID: ${value} **(updated)**`;
					else valueString += "Not set **(updated)**";

					response += valueString;
				} else {
					const valueString = mention
						? `${mention} (${value})`
						: `Couldn't find anything with ID: ${value}`;

					response += `\n• **${keyStr}**: ${
						value ? valueString : "Not set"
					}`;
				}
			}

			intr.editReply(response);

			intr.logger.log(`Used method SET on option ${option}: ${value}`);

			break;
		}
	}
}

export const getCommand = () =>
	({ options, data, execute } as Partial<Command>);
