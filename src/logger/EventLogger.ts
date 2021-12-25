import { Client, MessageEmbed, type Guild, type GuildMember } from "discord.js";
import { LoggerTypes } from "../constants/index.js";
import ConfigManager from "../database/ConfigManager.js";
import Util from "../utils/index.js";
import BaseLogger from "./BaseLogger.js";

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
		this.print(LoggerTypes.Event, this.event ?? "EVENT", ...messages);
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

		const getDate = (date: Date | undefined | null) => {
			return date ? Util.date(date) : "Date not found";
		};

		const user = member.user ?? (await this.client.users.fetch(member.id).catch(() => null));

		const color = this.client.colors[joined ? "green" : "red"];
		const footer = joined ? "User joined" : "User left";

		const joinedAtStr = member.joinedAt ? `\nJoined: ${getDate(member.joinedAt)}` : "";

		const descriptionStr =
			`User: ${member} (${member.id})\n` + //
			`Account made: ${getDate(user.createdAt)}` +
			joinedAtStr;

		const embed = new MessageEmbed()
			.setAuthor({
				name: `${user?.tag ?? "User not found"} (${member.id})`,
				iconURL: (member ?? user)?.displayAvatarURL()
			})
			.setColor(color)
			.setFooter(footer)
			.setDescription(descriptionStr);

		channel.send({ embeds: [embed] }).catch(() => {});
	}
}
