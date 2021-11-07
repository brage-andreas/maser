import type { InstanceData } from "../typings.js";
import type { Client } from "./";

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

	get hexColor() {
		const { colors } = this.client;
		const { type } = this.data;

		if (type === INSTANCE_TYPES.Softban) return colors.orange;
		if (type === INSTANCE_TYPES.Kick) return colors.yellow;
		if (type === INSTANCE_TYPES.Warn) return colors.black;
		if (type === INSTANCE_TYPES.Mute) return "#FFDA9B";
		if (type === INSTANCE_TYPES.Ban) return colors.red;
		return colors.green;
	}

	get type() {
		const { type } = this.data;

		if (type === INSTANCE_TYPES.Softban) return "Softban";
		if (type === INSTANCE_TYPES.Kick) return "Kick";
		if (type === INSTANCE_TYPES.Warn) return "Warn";
		if (type === INSTANCE_TYPES.Mute) return "Mute";
		if (type === INSTANCE_TYPES.Ban) return "Ban";
		return "Unknown";
	}

	public toEmbed() {
		const {
			instanceId, //
			referenceId,
			executorTag,
			executorId,
			targetTag,
			timestamp,
			targetId,
			duration,
			reason
		} = this.data;

		const instanceEmbed = new MessageEmbed()
			.setAuthor(`${executorTag} (${executorId})`)
			.setColor(this.hexColor)
			.setFooter(`#${instanceId}`)
			.setTimestamp(timestamp);

		const description = [`**Type**: ${this.type}`];

		if (targetTag || targetId)
			description.push(
				`**Target**: ${targetTag ?? "Tag unavailable"} (${targetId ? targetId : "id unavailable"})`
			);

		if (reason) description.push(`**Reason**: ${reason}`);
		if (duration) description.push(`**Duration**: ${ms(duration)}`);
		if (referenceId) description.push(`**Reference**: #${referenceId}`);

		return instanceEmbed.setDescription(description.join("\n"));
	}
}
