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

		if (type === INSTANCE_TYPES.SOFTBAN) return colors.orange;
		if (type === INSTANCE_TYPES.KICK) return colors.yellow;
		if (type === INSTANCE_TYPES.WARN) return colors.black;
		if (type === INSTANCE_TYPES.MUTE) return "#FFDA9B";
		if (type === INSTANCE_TYPES.BAN) return colors.red;
		return colors.green;
	}

	get type() {
		const { type } = this.data;

		if (type === INSTANCE_TYPES.SOFTBAN) return "Softban";
		if (type === INSTANCE_TYPES.KICK) return "Kick";
		if (type === INSTANCE_TYPES.WARN) return "Warn";
		if (type === INSTANCE_TYPES.MUTE) return "Mute";
		if (type === INSTANCE_TYPES.BAN) return "Ban";
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

		//const executor = await this.client.users.fetch(executorId).catch(() => null);
		//const target = await this.client.users.fetch(targetId).catch(() => null)

		const instanceEmbed = new MessageEmbed()
			.setAuthor(`${executorTag} (${executorId})`)
			.setColor(this.hexColor)
			.setFooter(`#${instanceId}`)
			.setTimestamp(timestamp)
			.setDescription(this.type);

		if (targetTag || targetId) {
			const targetStr = `Tag: ${targetTag ?? "Unavailable"}\nId: ${targetId ?? "Unavailable"}`;
			instanceEmbed.addField("Target", targetStr);
		}

		if (reason) instanceEmbed.addField("Reason", reason);
		if (duration) instanceEmbed.addField("Duration", ms(duration));
		if (referenceId) instanceEmbed.addField("Reference", `#${referenceId}`);

		return instanceEmbed;
	}
}
