import { MessageEmbed, type Client, type Message } from "discord.js";
import { type InstanceData } from "../typings/index.js";

import { InstanceTypes } from "../constants.js";
import InstanceManager from "../database/InstanceManager.js";
import ConfigManager from "../database/ConfigManager.js";
import ms from "ms";

export default class Instance {
	public readonly client: Client;
	public readonly data: InstanceData;
	public reference: Instance | null;

	// Data shorthands
	public readonly referenceId: number | null;
	public readonly timestamp: number;
	public readonly guildId: string;
	public readonly edited: boolean;
	public readonly reason: string | null;
	public readonly id: number;

	constructor(client: Client, data: InstanceData) {
		this.reference = null;
		this.client = client;
		this.data = data;

		this.referenceId = data.referenceId;
		this.timestamp = data.timestamp;
		this.guildId = data.guildId;
		this.edited = data.edited;
		this.reason = data.reason;
		this.id = data.instanceId;
	}

	public get hexColor(): `#${string}` {
		const { colors } = this.client;
		const { type } = this.data;

		if (type === InstanceTypes.Softban) return colors.orange;
		if (type === InstanceTypes.Unban) return colors.green;
		if (type === InstanceTypes.Kick) return colors.yellow;
		if (type === InstanceTypes.Warn) return colors.blue;
		if (type === InstanceTypes.Mute) return colors.black;
		if (type === InstanceTypes.Ban) return colors.red;
		return colors.invisible;
	}

	public get type(): string {
		const { type } = this.data;

		switch (type) {
			case InstanceTypes.Softban:
				return "Softban";

			case InstanceTypes.Unban:
				return "Unban";

			case InstanceTypes.Kick:
				return "Kick";

			case InstanceTypes.Warn:
				return "Warn";

			case InstanceTypes.Mute:
				return "Mute";

			case InstanceTypes.Ban:
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

	public async getReference(): Promise<Instance | null> {
		if (!this.data.referenceId) return null;

		const manager = new InstanceManager(this.client, this.data.guildId);
		this.reference = await manager.getInstance(this.data.referenceId);

		return this.reference;
	}

	public toEmbed(): MessageEmbed {
		const instanceEmbed = new MessageEmbed()
			.setAuthor(`${this.executor.tag} (${this.executor.id})`)
			.setFooter(`#${this.id} ${this.edited ? "• Edited" : ""}`)
			.setTimestamp(this.timestamp)
			.setColor(this.hexColor);

		const description = [`**Type**: ${this.type}`];

		if (this.target.tag || this.target.id) {
			const targetTag = this.target.tag ?? "Name unavailable";
			const targetId = this.target.id ?? "ID unavailable";
			description.push(`**Target**: ${targetTag} (${targetId})`);
		}

		if (this.reason) description.push(`**Reason**: ${this.reason}`);
		if (this.duration && this.type === "Mute") description.push(`**Duration**: ${this.duration}`);

		if (this.reference || this.referenceId) {
			const validReference = !!this.reference && !!this.reference.data.url;
			const str = validReference
				? `[Instance #${this.reference!.id}](${this.reference!.data.url})`
				: `#${this.referenceId}`;

			description.push(`**Reference**: ${str}`);
		}

		return instanceEmbed.setDescription(description.join("\n"));
	}

	public async channelLog(): Promise<Message | null> {
		const modLogManager = new ConfigManager(this.client, this.guildId, "modLogChannel");

		const channel = await modLogManager.getChannel();
		if (!channel) return null;

		return await channel.send({ embeds: [this.toEmbed()] }).catch(() => null);
	}
}
