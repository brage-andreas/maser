import { type APIEmbed } from "discord-api-types/v9";
import { type Client, type Message, type MessageEditOptions } from "discord.js";
import ms from "ms";
import { CaseTypes } from "../constants/database.js";
import { REGEXP } from "../constants/index.js";
import CaseManager from "../database/CaseManager.js";
import ConfigManager from "../database/ConfigManager.js";
import { type CaseData } from "../typings/database.js";

export default class Case {
	public readonly client: Client;
	public readonly data: CaseData;
	public reference: Case | null;
	public deleted = false;

	// Data shorthands
	public readonly referenceId: number | null;
	public readonly timestamp: number;
	public readonly guildId: string;
	public readonly edited: boolean;
	public readonly reason: string | null;
	public readonly id: number;

	public constructor(client: Client, data: CaseData) {
		this.reference = null;

		this.client = client;

		this.data = data;

		this.referenceId = data.referenceId;

		this.timestamp = data.timestamp;

		this.guildId = data.guildId;

		this.edited = data.edited;

		this.reason = data.reason;

		this.id = data.caseId;
	}

	public get hexColor(): number {
		const { colors } = this.client;
		const { type } = this.data;

		switch (type) {
			case CaseTypes.Untimeout:
				return colors.green;

			case CaseTypes.Softban:
				return colors.orange;

			case CaseTypes.Timeout:
				return colors.black;

			case CaseTypes.Unban:
				return colors.green;

			case CaseTypes.Kick:
				return colors.yellow;

			case CaseTypes.Warn:
				return colors.blue;

			case CaseTypes.Ban:
				return colors.red;

			default:
				return colors.invisible;
		}
	}

	public get type(): string {
		const { type } = this.data;

		switch (type) {
			case CaseTypes.Softban:
				return "Softban";

			case CaseTypes.Unban:
				return "Unban";

			case CaseTypes.Kick:
				return "Kick";

			case CaseTypes.Warn:
				return "Warn";

			case CaseTypes.Timeout:
				return "Mute";

			case CaseTypes.Ban:
				return "Ban";

			default:
				return "Unknown";
		}
	}

	public get duration() {
		if (!this.data.duration) return null;

		return ms(this.data.duration, { long: true });
	}

	public get executor() {
		return {
			avatar: this.data.executorAvatar ?? undefined,
			tag: this.data.executorTag,
			id: this.data.executorId
		};
	}

	public get target() {
		return {
			tag: this.data.targetTag,
			id: this.data.targetId
		};
	}

	public get messageURL() {
		return this.data.url;
	}

	public async getReference(): Promise<Case | null> {
		if (!this.data.referenceId) return null;

		const manager = new CaseManager(this.client, this.data.guildId);

		this.reference = await manager.getCase(this.data.referenceId);

		return this.reference;
	}

	public toEmbed(): APIEmbed {
		const caseEmbed: APIEmbed = {
			author: {
				name: `${this.executor.tag} (${this.executor.id})`,
				icon_url: this.executor.avatar
			},
			footer: {
				text: this.deleted
					? "Case deleted"
					: `#${this.id} ${this.edited ? "• Edited" : ""}`
			},
			timestamp: this.timestamp.toString(),
			color: this.hexColor
		};

		const description = [`**Type**: ${this.type}`];

		if (this.target.tag || this.target.id) {
			const targetTag = this.target.tag ?? "Name unavailable";
			const targetId = this.target.id ?? "ID unavailable";

			description.push(`**Target**: \`${targetTag}\` (${targetId})`);
		}

		if (this.reason) description.push(`**Reason**: ${this.reason}`);

		if (this.duration && this.type === "Mute")
			description.push(`**Duration**: ${this.duration}`);

		if (this.reference || this.referenceId) {
			const validReference =
				Boolean(this.reference) && Boolean(this.reference!.data.url);

			const str = validReference
				? `[Case #${this.reference!.id}](${this.reference!.data.url})`
				: `Case #${this.referenceId}`;

			description.push(`**Reference**: ${str}`);
		}

		caseEmbed.description = description.join("\n");

		return caseEmbed;
	}

	public async channelLog(): Promise<Message | null> {
		const modLogManager = new ConfigManager(
			this.client,
			this.guildId,
			"modLogChannel"
		);

		const channel = await modLogManager.getChannel();

		if (!channel) return null;

		return await channel
			.send({ embeds: [this.toEmbed()] })
			.catch(() => null);
	}

	public async updateLogMessage(data?: MessageEditOptions): Promise<boolean> {
		if (!this.messageURL) return false;

		// "discord.com/channels/<guild id>/<channel id>/<message id>"
		const [guildId, channelId, messageId] = [
			...this.messageURL.matchAll(REGEXP.ID)
		].map((e) => e[0]);

		const guild = this.client.guilds.cache.get(guildId);
		const channel = guild?.channels.cache.get(channelId);

		if (!channel?.isTextBased()) return false;

		const msg = await channel.messages.fetch(messageId);

		return await msg
			.edit(data ?? { embeds: [this.toEmbed()] })
			.then(() => true)
			.catch(() => false);
	}
}
