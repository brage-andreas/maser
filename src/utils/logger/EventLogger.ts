import { MessageEmbed, type Guild, type GuildMember } from "discord.js";
import type { Client } from "../../extensions/";

import { LOGGER_TYPES } from "../../constants.js";
import ConfigManager from "../../database/src/config/ConfigManager.js";
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

	public async memberLog(member: GuildMember, joined: boolean) {
		const config = new ConfigManager(this.client, member.guild.id, "member_log_channel_id");

		const channel = await config.getChannel();
		if (!channel) return;

		const color = this.client.colors.try(joined ? "GREEN" : "RED");
		const footer = joined ? "User joined" : "User left";
		const descriptionArray = [
			`User: ${member} (${member.id})\n`,
			`Account made: ${Util.date(member.user.createdAt)}\n`,
			`Joined: ${member.joinedAt ? Util.date(member.joinedAt) : "Date not found"}`
		];

		const embed = new MessageEmbed()
			.setTimestamp()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(color)
			.setFooter(footer)
			.setDescription(descriptionArray.join("\n"));

		channel.send({ embeds: [embed] }).catch(() => {});
	}
}
