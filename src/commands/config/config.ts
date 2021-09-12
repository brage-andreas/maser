import type { ApplicationCommandData, TextChannel } from "discord.js";
import type { CmdIntr } from "../../typings.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { ConfigManager } from "../../database/ConfigManager.js";

export const data: ApplicationCommandData = {
	name: "config",
	description: "Manages this server's config",
	options: [
		{
			name: "bot-log-channel",
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
							name: "new-channel",
							description: "The new channel to set to. Omitting this option will remove its value",
							type: ApplicationCommandOptionType.Channel as number
						}
					]
				}
			]
		},
		{
			name: "member-log-channel",
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
							name: "new-channel",
							description: "The new channel to set to. Omitting this option will remove its value",
							type: ApplicationCommandOptionType.Channel as number
						}
					]
				}
			]
		}
	]
};

export async function execute(intr: CmdIntr) {
	const option = intr.options.getSubcommandGroup();
	const method = intr.options.getSubcommand();

	if (intr.user.id !== intr.client.application.owner?.id) return intr.editReply({ content: "No" });

	const config = new ConfigManager(intr.client).setGuild(intr.guild);

	// TODO: refactor
	// temporary
	const base =
		option === "member-log-channel"
			? config.memberLogChannel
			: option === "bot-log-channel"
			? config.botLogChannel
			: null;

	switch (method) {
		case "view": {
			const channel = await base?.get();
			intr.editReply(channel?.toString() ?? "Not set");

			intr.logger.log(`Used method VIEW on option ${option.toUpperCase()}:\n  ${channel?.id ?? "Not set"}`);
			break;
		}

		case "set": {
			const channel = intr.options.getChannel("new-channel");

			if (channel && channel.type !== "GUILD_TEXT") {
				intr.editReply("The channel needs to be a text-channel.");
				break;
			}

			const res = await base?.set((channel as TextChannel | null) ?? "null");
			intr.editReply(`${res}`);

			intr.logger.log(`Used method SET on option ${option.toUpperCase()}:\n  ${channel?.id ?? "null"}`);
			break;
		}
	}
}
