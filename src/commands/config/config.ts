import type { ApplicationCommandData, TextChannel } from "discord.js";
import type { CmdIntr } from "../../typings.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { ConfigManager } from "../../database/configs.js";

export const data: ApplicationCommandData = {
	name: "config",
	description: "Manages this server's config",
	options: [
		{
			name: "bot-log-channel",
			description: "..",
			type: ApplicationCommandOptionType.SubcommandGroup as number,
			options: [
				{
					name: "view",
					description: "views",
					type: ApplicationCommandOptionType.Subcommand as number
				},
				{
					name: "set",
					description: "sets. Omit = remove",
					type: ApplicationCommandOptionType.Subcommand as number,
					options: [
						{
							name: "new-channel",
							description: "The new channel to set to",
							type: ApplicationCommandOptionType.Channel as number
						}
					]
				}
			]
		},
		{
			name: "member-log-channel",
			description: "..",
			type: ApplicationCommandOptionType.SubcommandGroup as number,
			options: [
				{
					name: "view",
					description: "views",
					type: ApplicationCommandOptionType.Subcommand as number
				},
				{
					name: "set",
					description: "sets. Omit = remove",
					type: ApplicationCommandOptionType.Subcommand as number,
					options: [
						{
							name: "new-channel",
							description: "The new channel to set to",
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

	const config = new ConfigManager(intr.client);

	// TODO: refactor
	// horrible design, don't do it like this
	const base =
		option === "member-log-channel"
			? config.memberLogChannel
			: option === "bot-log-channel"
			? config.botLogChannel
			: null;

	if (method === "view") {
		const channel = await base?.get(intr.guild);
		intr.editReply(channel?.toString() ?? "Not set");
	} else if (method === "set") {
		const channel = intr.options.getChannel("new-channel");

		if (channel && channel.type !== "GUILD_TEXT") {
			intr.editReply("The channel needs to be a text-channel.");
		} else {
			const res = await base?.set((channel as TextChannel | null) ?? "null", intr.guild);
			intr.editReply(`${res}`);
		}
	}

	intr.logger.log("Configged");
}
