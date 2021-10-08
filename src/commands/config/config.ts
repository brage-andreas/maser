import type { CommandInteraction, ConfigColumns } from "../../typings.js";
import type { ApplicationCommandData } from "discord.js";

import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { ConfigResultKeys } from "../../constants.js";
import { MessageEmbed } from "discord.js";
import ConfigManager from "../../database/config/ConfigManager.js";
import logs from "./modules/logs.js";

export const priv = true;
export const data: ApplicationCommandData = {
	name: "config",
	description: "Manages this server's config",
	options: [
		{
			name: "bot-log",
			description: "Options for this server's bot log channel",
			type: ApplicationCommandOptionType.SubcommandGroup as number,
			options: [
				{
					name: "view",
					description: "Sends the option's value",
					type: ApplicationCommandOptionType.Subcommand as number
				},
				{
					name: "set",
					description: "Sets a new value for the option",
					type: ApplicationCommandOptionType.Subcommand as number,
					options: [
						{
							name: "channel",
							description: "The new channel to set to. Omitting this option will remove its value",
							channelTypes: ["GUILD_TEXT", "GUILD_NEWS", "GUILD_STORE"],
							type: ApplicationCommandOptionType.Channel as number
						}
					]
				}
			]
		},
		{
			name: "member-log",
			description: "Options for this server's member log channel",
			type: ApplicationCommandOptionType.SubcommandGroup as number,
			options: [
				{
					name: "view",
					description: "Sends the option's value",
					type: ApplicationCommandOptionType.Subcommand as number
				},
				{
					name: "set",
					description: "Sets a new value for the option",
					type: ApplicationCommandOptionType.Subcommand as number,
					options: [
						{
							name: "channel",
							description: "The new channel to set to. Omitting this option will remove its value",
							channelTypes: ["GUILD_TEXT", "GUILD_NEWS", "GUILD_STORE"],
							type: ApplicationCommandOptionType.Channel as number
						}
					]
				}
			]
		},
		{
			name: "view-config",
			description: "Sends the full config",
			type: ApplicationCommandOptionType.Subcommand as number
		}
	]
};

export async function execute(intr: CommandInteraction) {
	const option = intr.options.getSubcommandGroup(false);
	const method = intr.options.getSubcommand();

	const config = new ConfigManager(intr.client, intr.guild.id);

	// TODO
	if (method === "view-config") {
		const res = await config.botLog.getAll(); // temporary

		const configEmbed = new MessageEmbed()
			.setAuthor(`${intr.user.tag} (${intr.user.id})`, intr.member.displayAvatarURL())
			.setColor(intr.client.colors.try("INVIS"))
			.setTitle("Config")
			.setTimestamp();

		for (let [key, value] of Object.entries(res)) {
			key = ConfigResultKeys[key as ConfigColumns];

			const guild = intr.client.guilds.cache.get(value)?.name ?? null;
			const channel = intr.guild.channels.cache.get(value)?.toString() ?? null;
			// const user = intr.client.users.fetch(value).then((user) => `${user}`).catch(() => null);
			// const member = intr.guild.members.fetch(value).then((member) => `${member}`).catch(() => null);
			const role = intr.guild.roles.cache.get(value)?.toString() ?? null;

			const notFound = !!value && !guild && !channel && !role;
			const none = !value;

			const valueStr = none
				? "None"
				: notFound
				? `Couldn't find anything with id: ${value}`
				: guild ?? channel ?? role ?? "Something went wrong";

			configEmbed.addField(key, valueStr);
		}

		intr.editReply({ embeds: [configEmbed] });

		intr.logger.log("Sent full config");
	}

	switch (option) {
		case "member-log":
		case "bot-log":
			await logs({ intr, option, method, config });
			break;
	}
}
