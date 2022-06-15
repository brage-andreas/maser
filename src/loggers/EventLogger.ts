import {
	type Client,
	type Guild,
	type GuildMember,
	type PartialGuildMember
} from "discord.js";
import { COLORS, LoggerTypes } from "../constants/index.js";
import ConfigManager from "../database/ConfigManager.js";
import Util from "../utils/index.js";
import BaseLogger from "./BaseLogger.js";

export default class EventLogger extends BaseLogger {
	public readonly client: Client;
	public event: string | null;

	public constructor(client: Client) {
		super();

		this.client = client;

		this.event = null;
	}

	public log(...messages: Array<string>) {
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

	public async memberLog(
		member: GuildMember | PartialGuildMember,
		joined: boolean
	) {
		const configManager = new ConfigManager(this.client, member.guild.id);

		const channel = await configManager.get.memberLogChannel();

		if (!channel) {
			return;
		}

		const getDate = (date: Date | null | undefined) =>
			date ? Util.fullDate(date) : "Date not found";

		const user =
			member.user ??
			(await this.client.users.fetch(member.id).catch(() => null));

		const color = joined ? COLORS.green : COLORS.red;
		const footer = joined ? "User joined" : "User left";

		const joinedAtStr = member.joinedAt
			? `\nJoined: ${getDate(member.joinedAt)}`
			: "";

		const descriptionStr =
			`User: ${member} (${member.id})\n` + //
			`Account made: ${getDate(user.createdAt)}${joinedAtStr}`;

		const embed = {
			author: {
				name: `${user?.tag ?? "User not found"} (${member.id})`,
				iconURL: (member ?? user)?.displayAvatarURL()
			},
			description: descriptionStr,
			footer: { text: footer },
			color
		};

		channel.send({ embeds: [embed] }).catch(() => null);
	}
}
