import { oneLine } from "common-tags";
import {
	ButtonStyle,
	ComponentType,
	type APIButtonComponentWithCustomId,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import ConfigManager from "../../database/ConfigManager.js";
import type Logger from "../../loggers/index.js";
import ButtonManager from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import { createList } from "../../utils/index.js";

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
	style: ButtonStyle.Secondary,
	custom_id: "botLog",
	label: "Bot Log",
	type: ComponentType.Button
};

const memberLogButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Secondary,
	custom_id: "memberLog",
	label: "Member Log",
	type: ComponentType.Button
};

const modLogButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Secondary,
	custom_id: "modLog",
	label: "Mod Log",
	type: ComponentType.Button
};

const editOptionButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Success,
	custom_id: "editOption",
	label: "Edit option",
	type: ComponentType.Button
};

const resetOptionButton: APIButtonComponentWithCustomId = {
	style: ButtonStyle.Danger,
	custom_id: "resetOption",
	label: "Reset option",
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
				? "Not found"
				: !ch
				? "Not set"
				: `${ch}, ${ch.name} (${ch.id})`;

		const setMsg = createList({
			"Channel": chStr,
			"Recommended privacy": options.recommendedPrivacy
		});

		return `${options.description}\n\n${setMsg}`;
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

			buttonManager.setRows([editOptionButton, resetOptionButton]);

			const info = getInfo({
				channelId,
				description: oneLine`
					The bot log will log every action
					the bot does, and who triggered it
				`,
				name: "bot log",
				recommendedPrivacy: "Private"
			});

			intr.editReply({ content: info, components: buttonManager.rows });
		}
	});

	logger;
}

export const getCommand = () =>
	({
		data,
		options,
		execute
	} as Partial<Command>);
