import type { InstanceData } from "../typings.js";
import type { Client } from "./index.js";

import { InstanceTypes } from "../constants.js";
import { MessageEmbed } from "./index.js";
import ms from "ms";

export default class Instance {
	public readonly client: Client;
	public readonly data: InstanceData;

	// Data shorthands
	public readonly referenceId: number | null;
	public readonly timestamp: number;
	public readonly edited: boolean;
	public readonly reason: string | null;
	public readonly id: number;

	constructor(client: Client, data: InstanceData) {
		this.client = client;
		this.data = data;

		this.referenceId = data.referenceId;
		this.timestamp = data.timestamp;
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

	public post() {
		// TODO
		// * find mod log channel
		// * send message, store URL
		// * update URL in
	}

	public toEmbed(): MessageEmbed {
		const instanceEmbed = new MessageEmbed()
			.setAuthor(`${this.executor.tag} (${this.executor.id})`)
			.setFooter(`#${this.id} ${this.edited ? "• This instance has been edited" : ""}`)
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
		if (this.referenceId) description.push(`**Reference**: #${this.referenceId}`);

		return instanceEmbed.setDescription(description.join("\n"));
	}
}
