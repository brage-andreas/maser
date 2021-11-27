import type { Guild, GuildMember } from "discord.js";
import type { Client } from "../../modules";

import { LOGGER_TYPES } from "../../constants.js";
import { MessageEmbed } from "../../modules/";
import ConfigManager from "../../database/ConfigManager.js";
import BaseLogger from "./BaseLogger.js";
import Util from "../index.js";

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
		this.print(LOGGER_TYPES.Event, this.event ?? "EVENT", ...messages);
	}

	public setEvent(event: string | null) {
		this.event = event;
		return this;
	}

	public setGuild(guild: Guild | null) {
		this.traceValues.setGuild(guild);
		return this;
	}

	public async memberLog(member: GuildMember, joined: boolean) {
		const config = new ConfigManager(this.client, member.guild.id, "memberLogChannel");

		const channel = await config.getChannel();
		if (!channel) return;

		const color = this.client.colors[joined ? "green" : "red"];
		const footer = joined ? "User joined" : "User left";
		const descriptionStr =
			`User: ${member} (${member.id})\n` +
			`Account made: ${Util.date(member.user.createdAt)}\n` +
			`Joined: ${member.joinedAt ? Util.date(member.joinedAt) : "Date not found"}`;

		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.displayAvatarURL())
			.setColor(color)
			.setFooter(footer)
			.setDescription(descriptionStr);

		channel.send({ embeds: [embed] }).catch(() => {});
	}
}
