import { Guild, MessageEmbed, TextBasedChannels, User } from "discord.js";
import { getLogChannel } from "../../database/logChannel.js";
import type { CmdIntr } from "../../Typings.js";
import { BaseLogger } from "./BaseLogger.js";

export class CommandLogger extends BaseLogger {
	public interaction: CmdIntr;
	public name: string;

	constructor(intr: CmdIntr) {
		super();

		this.interaction = intr;
		this.name = intr.commandName.toUpperCase();

		this.traceValues.setUser(intr.user);
		this.traceValues.setGuild(intr.guild);

		if (intr.channel && intr.channel.type !== "DM") {
			this.traceValues.setChannel(intr.channel);
		}
	}

	public log(...messages: string[]) {
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

	// prototype
	private channelLog(...messages: string[]) {
		getLogChannel(this.interaction.guild).then((channel) => {
			if (!channel || !channel.isText()) return;

			const author = this.interaction.user;
			const command = this.interaction.commandName;
			const embeds = [
				new MessageEmbed()
					.setAuthor(`${author.tag} (${author.id})`)
					// will error on large messages
					.addField(`Used command ${command}`, messages.join("\n"))
			];

			channel.send({ embeds }).catch(() => null);
		});
	}
}
