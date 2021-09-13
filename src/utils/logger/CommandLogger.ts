import type { Guild, TextBasedChannels, User } from "discord.js";
import type { CmdIntr } from "../../typings.js";

import { ConfigManager } from "../../database/ConfigManager.js";
import { MessageEmbed } from "discord.js";
import { LoggerTypes } from "../../constants.js";
import BaseLogger from "./BaseLogger.js";

export default class CommandLogger extends BaseLogger {
	public interaction: CmdIntr | null;
	public name: string | null;

	constructor(intr?: CmdIntr) {
		super();

		this.interaction = intr ?? null;
		this.name = intr?.commandName.toUpperCase() ?? null;

		this.traceValues.setUser(intr?.user ?? null);
		this.traceValues.setGuild(intr?.guild ?? null);

		if (intr?.channel && intr.channel.type !== "DM") {
			this.traceValues.setChannel(intr.channel);
		}
	}

	public log(...messages: string[]) {
		if (!this.name) throw new Error("Name of command must be set to log command");
		this.print(LoggerTypes.COMMAND, this.name, ...messages);
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

	public setChannel(channel: TextBasedChannels | null) {
		if (!channel || channel.type !== "DM") {
			this.traceValues.setChannel(channel);
		}

		return this;
	}

	public setName(name: string | null) {
		this.name = name;
		return this;
	}

	public setAll(options: {
		user?: User | null;
		guild?: Guild | null;
		channel?: TextBasedChannels | null;
		name?: string | null;
	}) {
		const { user, guild, channel, name } = options;

		if (name !== undefined) this.setName(name);
		if (user !== undefined) this.setUser(user);
		if (guild !== undefined) this.setGuild(guild);
		if (channel !== undefined) this.setChannel(channel);

		return this;
	}

	// prototype
	private channelLog(...messages: string[]) {
		if (!this.interaction) return;

		const config = new ConfigManager(this.interaction.client).setGuild(this.interaction.guildId);

		config.botLogChannel.get().then((channel) => {
			if (!this.interaction) return;
			if (!channel) return;

			const author = this.interaction.user;
			const command = this.interaction.commandName;

			const firstMsg = `Used command ${command}\n`;
			const length = messages.length;

			const embeds = messages.map((msg, i) => {
				const embed = new MessageEmbed().setTimestamp();

				if (i === 0) embed.setAuthor(i === 0 ? `${author.tag} (${author.id})` : "");
				if (length > 1) embed.setFooter(`${i + 1}/${length}`);

				embed.setColor(this.interaction!.client.colors.try("INVIS"));
				embed.setDescription(`${i === 0 ? firstMsg : ""}\`\`\`\n${msg}\n\`\`\``);

				return embed;
			});

			channel.send({ embeds }).catch(() => null);
		});
	}
}
