import { stripIndent } from "common-tags";
import {
	ButtonStyle,
	ComponentType,
	type APIButtonComponentWithCustomId,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import ConfigManager from "../../database/ConfigManager.js";
import { e } from "../../emojis/index.js";
import type Logger from "../../loggers/index.js";
import ButtonManager from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import { bold } from "../../utils/discordMarkdown.js";

const options: Partial<CommandOptions> = { wip: true };

const data: ChatInputApplicationCommandData = {
	name: "config",
	description: "Manages the config for this server"
};

/*
	botLogChId?: string | null;
	memberLogChId?: string | null;
	modLogChId?: string | null;
*/

const botLogButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Primary,
	custom_id: "botLog",
	label: "Bot Log",
	type: ComponentType.Button
};

const memberLogButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Primary,
	custom_id: "memberLog",
	label: "Member Log",
	type: ComponentType.Button
};

const modLogButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Primary,
	custom_id: "modLog",
	label: "Mod Log",
	type: ComponentType.Button
};

const assignChannelOptionButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Success,
	custom_id: "editOption",
	label: "Assign channel",
	type: ComponentType.Button
};

const resetOptionButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Danger,
	custom_id: "resetOption",
	label: "Reset option",
	type: ComponentType.Button
};

const backButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Secondary,
	custom_id: "back",
	label: "Back",
	type: ComponentType.Button
};

async function execute(
	intr: ChatInputCommandInteraction<"cached">,
	logger: Logger
) {
	const getInfo = (options: {
		channelId: string | null;
		name: string;
		description: string;
		recommendedPrivacy: "Any" | "Private" | "Public";
	}) => {
		const ch = options.channelId
			? intr.guild.channels.cache.get(options.channelId)
			: null;

		const chStr =
			ch === undefined
				? e`{warning} Channel with assigned ID not found (${options.channelId})`
				: !ch
				? "None"
				: `${ch}, \`${ch.name}\` (${ch.id})`;

		return stripIndent`
			${bold(options.name)}
			• ${options.description}

			**Currently assigned:** ${chStr}

			Recommended privacy: ${options.recommendedPrivacy}
		`;
	};

	const configManager = new ConfigManager(intr.client, intr.guildId);

	const buttonManager = new ButtonManager().setRows([
		botLogButton,
		memberLogButton,
		modLogButton
	]);

	const msg = await intr.editReply({
		content: "Choose an option to manage:",
		components: buttonManager.rows
	});

	const collector = buttonManager.setMessage(msg).createCollector();

	collector.on("collect", async (interaction) => {
		if (interaction.customId === "botLog") {
			const channelId = await configManager.get.raw.botLogChannel();

			buttonManager.setRows([
				assignChannelOptionButton,
				resetOptionButton,
				backButton
			]);

			const info = getInfo({
				channelId,
				description: "Logs every action the bot does",
				name: "Bot Log",
				recommendedPrivacy: "Private"
			});

			interaction.update({
				content: info,
				components: buttonManager.rows
			});

			return;
		}

		if (interaction.customId === "modLog") {
			const channelId = await configManager.get.raw.botLogChannel();

			buttonManager.setRows([
				assignChannelOptionButton,
				resetOptionButton,
				backButton
			]);

			const info = getInfo({
				channelId,
				description: "Logs every mod action done with Maser",
				name: "Mod Log",
				recommendedPrivacy: "Public"
			});

			interaction.update({
				content: info,
				components: buttonManager.rows
			});

			return;
		}

		if (interaction.customId === "memberLog") {
			const channelId = await configManager.get.raw.botLogChannel();

			buttonManager.setRows([
				assignChannelOptionButton,
				resetOptionButton,
				backButton
			]);

			const info = getInfo({
				channelId,
				description: "Logs every user joining or leaving the server",
				name: "Member Log",
				recommendedPrivacy: "Any"
			});

			interaction.update({
				content: info,
				components: buttonManager.rows
			});
		}
	});

	logger.logInteraction("Sent config button menu");
}

export const getCommand = () =>
	({
		data,
		options,
		execute
	} as Partial<Command>);
