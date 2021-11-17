import type { InstanceData } from "../typings.js";
import type { Client } from "./index.js";

import { INSTANCE_TYPES } from "../constants.js";
import { MessageEmbed } from "discord.js";
import ms from "ms";

export default class Instance {
	public client: Client;
	public data: InstanceData;

	constructor(client: Client, data: InstanceData) {
		this.client = client;
		this.data = data;
	}

	public get hexColor(): "#FF8741" | "#FFC152" | "#000000" | "#5AD658" | "#FF5733" | "#FFDA9B" {
		const { colors } = this.client;
		const { type } = this.data;

		if (type === INSTANCE_TYPES.Softban) return colors.orange;
		if (type === INSTANCE_TYPES.Kick) return colors.yellow;
		if (type === INSTANCE_TYPES.Warn) return colors.black;
		if (type === INSTANCE_TYPES.Mute) return "#FFDA9B";
		if (type === INSTANCE_TYPES.Ban) return colors.red;
		return colors.green;
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

	public get id(): number {
		return this.data.instanceId;
	}

	public get duration(): string | null {
		if (!this.data.duration) return null;
		return ms(this.data.duration, { long: true });
	}

	public toEmbed(): MessageEmbed {
		const {
			instanceId, //
			referenceId,
			executorTag,
			executorId,
			targetTag,
			timestamp,
			targetId,
			reason
		} = this.data;

		const instanceEmbed = new MessageEmbed()
			.setAuthor(`${executorTag} (${executorId})`)
			.setFooter(`#${instanceId}`)
			.setTimestamp(timestamp)
			.setColor(this.hexColor);

		const description = [`**Type**: ${this.type}`];

		if (targetTag || targetId)
			description.push(
				`**Target**: ${targetTag ?? "Name unavailable"} (${targetId ? targetId : "ID unavailable"})`
			);

		if (reason) description.push(`**Reason**: ${reason}`);
		if (this.duration) description.push(`**Duration**: ${this.duration}`);
		if (referenceId) description.push(`**Reference**: #${referenceId}`);

		return instanceEmbed.setDescription(description.join("\n"));
	}
}
