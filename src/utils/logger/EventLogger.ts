import type { Clint } from "../../extensions/";
import { Guild, GuildMember, MessageEmbed } from "discord.js";

import { ConfigManager } from "../../database/ConfigManager.js";
import { LoggerTypes } from "../../constants.js";
import BaseLogger from "./BaseLogger.js";
import Util from "../";

export default class EventLogger extends BaseLogger {
	client: Clint;
	event: string | null;
	guild: Guild | null;

	constructor(client: Clint, guild?: Guild) {
		super();

		this.client = client;
		this.event = null;
		this.guild = guild ?? null;

		this.traceValues.setGuild(guild ?? null);
	}

	public log(...messages: string[]) {
		this.print(LoggerTypes.EVENT, this.event ?? "EVENT", ...messages);
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
		const config = new ConfigManager(this.client).setGuild(member.guild);

		config.memberLogChannel.get().then((channel) => {
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
