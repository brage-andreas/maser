import type { Guild, GuildMember, TextChannel } from "discord.js";
import type { Client } from "../../extensions/";

import { MessageEmbed } from "discord.js";
import { LOGGER_TYPES } from "../../constants.js";
import ConfigManager from "../../database/config/ConfigManager.js";
import BaseLogger from "./BaseLogger.js";
import Util from "../";

export default class EventLogger extends BaseLogger {
	client: Client;
	event: string | null;
	guild: Guild | null;

	constructor(client: Client, guild?: Guild) {
		super();

		this.client = client;
		this.event = null;
		this.guild = guild ?? null;

		this.traceValues.setGuild(guild ?? null);
	}

	public log(...messages: string[]) {
		this.print(LOGGER_TYPES.EVENT, this.event ?? "EVENT", ...messages);
	}

	public setEvent(event: string | null) {
		this.event = event;
		return this;
	}

	public setGuild(guild: Guild | null) {
		this.traceValues.setGuild(guild);
		return this;
	}

	// prototype
	public memberLog(member: GuildMember, joined: boolean) {
		const config = new ConfigManager(this.client, member.guild.id);

		config.memberLog.get<TextChannel>().then((channel) => {
			if (!channel) return;

			const embeds = [
				new MessageEmbed()
					.setTimestamp()
					.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
					.setColor(this.client.colors.try(joined ? "GREEN" : "RED"))
					.setFooter(joined ? "User joined" : "User left")
					.setDescription(
						`User: ${member} (${member.id})\n` +
							`Account made: ${Util.Date(member.user.createdAt)}\n` +
							`Joined: ${Util.Date(member.joinedAt!)}`
					)
			];

			channel.send({ embeds }).catch(() => null);
		});
	}
}
