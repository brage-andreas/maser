import type { Guild, TextBasedChannels, User } from "discord.js";
import type { CmdIntr } from "../../typings.js";

import { ConfigManager } from "../../database/ConfigManager.js";
import { MessageEmbed } from "discord.js";
import { BaseLogger } from "./BaseLogger.js";

export class CommandLogger extends BaseLogger {
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
		this.print("COMMAND", this.name, ...messages);
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
			if (!channel) return;

			const author = this.interaction!.user;
			const command = this.interaction!.commandName;
			const embeds = [
				new MessageEmbed()
					.setAuthor(`${author.tag} (${author.id})`)
					.setColor(this.interaction!.client.colors.try("INVIS"))
					// will error on large messages
					.setDescription(`Used command ${command}\n\`\`\`\n${messages.join("\n")}\n\`\`\``)
			];

			channel.send({ embeds }).catch(() => null);
		});
	}
}
