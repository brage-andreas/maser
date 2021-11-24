import type { InstanceData } from "../typings.js";
import type { Client } from "./index.js";

import { INSTANCE_TYPES } from "../constants.js";
import { MessageEmbed } from "discord.js";
import ms from "ms";

export default class Instance {
	public client: Client;
	public data: InstanceData;

	// Data
	public referenceId: number | null;
	public timestamp: number;
	public reason: string | null;
	public id: number;

	constructor(client: Client, data: InstanceData) {
		this.client = client;
		this.data = data;

		this.referenceId = data.referenceId;
		this.timestamp = data.timestamp;
		this.reason = data.reason;
		this.id = data.instanceId;
	}

	public get hexColor(): `#${string}` {
		const { colors } = this.client;
		const { type } = this.data;

		if (type === INSTANCE_TYPES.Softban) return colors.orange;
		if (type === INSTANCE_TYPES.Unban) return colors.green;
		if (type === INSTANCE_TYPES.Kick) return colors.yellow;
		if (type === INSTANCE_TYPES.Warn) return colors.blue;
		if (type === INSTANCE_TYPES.Mute) return colors.black;
		if (type === INSTANCE_TYPES.Ban) return colors.red;
		return colors.invisible;
	}

	public get type(): "Softban" | "Kick" | "Warn" | "Mute" | "Ban" | "Unknown" {
		const { type } = this.data;

		if (type === INSTANCE_TYPES.Softban) return "Softban";
		if (type === INSTANCE_TYPES.Kick) return "Kick";
		if (type === INSTANCE_TYPES.Warn) return "Warn";
		if (type === INSTANCE_TYPES.Mute) return "Mute";
		if (type === INSTANCE_TYPES.Ban) return "Ban";
		return "Unknown";
	}

	public get duration(): string | null {
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

	public toEmbed(): MessageEmbed {
		const instanceEmbed = new MessageEmbed()
			.setAuthor(`${this.executor.tag} (${this.executor.id})`)
			.setFooter(`#${this.id}`)
			.setTimestamp(this.timestamp)
			.setColor(this.hexColor);

		const description = [`**Type**: ${this.type}`];

		if (this.target.tag || this.target.id) {
			const targetTag = this.target.tag ?? "Name unavailable";
			const targetId = this.target.id ?? "ID unavailable";
			description.push(`**Target**: ${targetTag} (${targetId})`);
		}

		if (this.reason) description.push(`**Reason**: ${this.reason}`);
		if (this.duration) description.push(`**Duration**: ${this.duration}`);
		if (this.referenceId) description.push(`**Reference**: #${this.referenceId}`);

		return instanceEmbed.setDescription(description.join("\n"));
	}
}
