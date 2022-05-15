import { type APIEmbed } from "discord-api-types/v9";
import {
	type AutocompleteInteraction,
	type CommandInteraction,
	type Guild,
	type GuildTextBasedChannel,
	type User
} from "discord.js";
import { COLORS, defaultEmbed, LoggerTypes } from "../constants/index.js";
import ConfigManager from "../database/ConfigManager.js";
import Util from "../utils/index.js";
import BaseLogger from "./BaseLogger.js";
import { gray } from "./LoggerColors.js";

export default class CommandLogger extends BaseLogger {
	public interaction:
		| AutocompleteInteraction<"cached">
		| CommandInteraction<"cached">
		| null;
	public name: string | null;

	public constructor(
		intr?: AutocompleteInteraction<"cached"> | CommandInteraction<"cached">
	) {
		super();

		this.interaction = intr ?? null;

		this.name = intr?.commandName.toUpperCase() ?? null;

		this.traceValues.setUser(intr?.user ?? null);

		this.traceValues.setGuild(intr?.guild ?? null);

		if (intr?.channel) this.traceValues.setChannel(intr.channel);
	}

	public log(...messages: string[]) {
		if (!this.name)
			throw new Error("Name of command must be set to log command");

		const command = this.interaction?.toString();
		const logLevel = this.interaction?.commandOptions.logLevel ?? 1;

		const toLog =
			command && logLevel !== 2
				? [gray(`>>> ${command}`), ...messages]
				: messages;

		this.print(LoggerTypes.Command, this.name, ...toLog);

		this.channelLog(...messages);
	}

	public setUser(user: User | null) {
		this.traceValues.setUser(user);

		return this;
	}

	public setGuild(guild: Guild | null) {
		this.traceValues.setGuild(guild);

		return this;
	}

	public setChannel(channel: GuildTextBasedChannel | null) {
		if (!channel) this.traceValues.setChannel(channel);

		return this;
	}

	public setName(name: string | null) {
		this.name = name;

		return this;
	}

	public setAll(options: {
		user?: User | null;
		guild?: Guild | null;
		channel?: GuildTextBasedChannel | null;
		name?: string | null;
	}) {
		const { user, guild, channel, name } = options;

		if (name !== undefined) this.setName(name);

		if (user !== undefined) this.setUser(user);

		if (guild !== undefined) this.setGuild(guild);

		if (channel !== undefined) this.setChannel(channel);

		return this;
	}

	private channelLog(...messages: string[]) {
		if (!this.interaction) return;

		const { client, guild } = this.interaction;
		const logLevel = this.interaction.commandOptions.logLevel;

		if (logLevel === 0) return;

		const createEmbed = (description: string, index = 0, total = 1) => {
			const { user } = this.interaction!;

			const embed: APIEmbed = {
				...defaultEmbed(this.interaction),
				color: COLORS.invisible,
				description
			};

			if (index === 0)
				embed.author = { name: `${user.tag} (${user.id})` };

			if (total > 1) embed.footer = { text: `${index + 1}/${total}` };

			return embed;
		};

		const botLogManager = new ConfigManager(
			client,
			guild.id,
			"botLogChannel"
		);

		botLogManager.getChannel().then((channel) => {
			if (!this.interaction) return; // not really needed - mostly for inferring types

			if (!channel) return;

			const commandStr = `\`${this.interaction.toString()}\`\n`;
			let embeds: APIEmbed[] = [];

			if (logLevel === 2)
				embeds = messages.map((msg, i) => {
					const prefix = i === 0 ? commandStr : "";
					const str = Util.mergeForCodeblock(msg, { prefix });

					return createEmbed(str, i, messages.length);
				});
			else embeds.push(createEmbed(commandStr));

			channel.send({ embeds }).catch(() => null);
		});
	}
}
