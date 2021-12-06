import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command, InstanceData } from "../../typings.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { InstanceTypes } from "../../constants.js";
import InstanceManager from "../../database/InstanceManager.js";
import ms from "ms";

const options = {
	private: true
};

// stupid enum shenanigans
const TYPE_CHOICES = Object.entries(InstanceTypes)
	.filter(([, value]) => typeof value === "number")
	.map(([key, value]) => ({ name: key, value: value }));
// { name: "Ban", value: 0 } etc.

const data: ChatInputApplicationCommandData = {
	name: "instance",
	description: "Manages this server's instances",
	options: [
		{
			name: "create",
			description: "Manually create an instance",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: [
				{
					name: "executor",
					description: "The executor of this instance",
					type: ApplicationCommandOptionTypes.USER,
					required: true
				},
				{
					name: "type",
					description: "The type of instance",
					type: ApplicationCommandOptionTypes.INTEGER,
					choices: TYPE_CHOICES,
					required: true
				},
				{
					name: "reason",
					description: "The reason for this instance",
					type: ApplicationCommandOptionTypes.STRING
				},
				{
					name: "reference-id",
					description: "The instance to reference's ID",
					type: ApplicationCommandOptionTypes.INTEGER
				},
				{
					name: "target",
					description: "The target of this instance",
					type: ApplicationCommandOptionTypes.USER
				},
				{
					name: "time",
					description:
						'The time since this instance. Accepts relative times (e.g. "5 min"). Default is current time',
					type: ApplicationCommandOptionTypes.STRING
				},
				{
					name: "duration",
					description: 'The duration of this instance. Accepts timestamps and relative times (e.g. "5min")',
					type: ApplicationCommandOptionTypes.STRING
				}
			]
		},
		{
			name: "edit",
			description: "Edit an instance",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: [
				{
					name: "instance-id",
					description: "The ID of the instance to edit",
					type: ApplicationCommandOptionTypes.INTEGER,
					required: true
				},
				{
					name: "executor",
					description: "The executor of this instance",
					type: ApplicationCommandOptionTypes.USER
				},
				{
					name: "reason",
					description: "The reason for this instance",
					type: ApplicationCommandOptionTypes.STRING
				},
				{
					name: "reference-id",
					description: "The instance to reference's ID",
					type: ApplicationCommandOptionTypes.INTEGER
				},
				{
					name: "target",
					description: "The target of this instance",
					type: ApplicationCommandOptionTypes.USER
				},
				{
					name: "time",
					description:
						'The time since this instance. Accepts relative times ("5 min"). Default is current time',
					type: ApplicationCommandOptionTypes.STRING
				},
				{
					name: "duration",
					description: 'The duration of this instance. Accepts timestamps and relative times ("5min")',
					type: ApplicationCommandOptionTypes.STRING
				}
			]
		},
		{
			name: "show",
			description: "Show an instance",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: [
				{
					name: "instance",
					description: "The ID of the instance to show",
					type: ApplicationCommandOptionTypes.INTEGER,
					required: true
				}
			]
		},
		{
			name: "delete",
			description: "Delete an instance",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: [
				{
					name: "instance",
					description: "The ID of the instance to delete",
					type: ApplicationCommandOptionTypes.INTEGER,
					required: true
				}
			]
		}
	]
};

async function execute(intr: CommandInteraction) {
	const sub = intr.options.getSubcommand();

	const { emXMark, emError } = intr.client.systemEmojis;
	const instances = new InstanceManager(intr.client, intr.guildId);
	await instances.initialise();

	if (sub === "create") {
		const reference = intr.options.getInteger("reference");
		const duration = intr.options.getString("duration");
		const executor = intr.options.getUser("executor", true);
		const reason = intr.options.getString("reason");
		const target = intr.options.getUser("target");
		const type = intr.options.getInteger("type", true);
		const time = intr.options.getString("time");

		const data: Partial<InstanceData> = {
			referenceId: reference ?? undefined,
			executorTag: executor.tag,
			executorId: executor.id,
			timestamp: time ? Date.now() - ms(time) : Date.now(),
			targetTag: target?.tag,
			duration: duration ? ms(duration) : undefined,
			targetId: target?.id,
			guildId: intr.guildId,
			edited: false,
			reason: reason ?? undefined,
			type: type,
			url: undefined
		};

		const instance = await instances.createInstance(data);
		intr.editReply({ embeds: [instance.toEmbed()] });

		intr.logger.log(`Manually created new instance of type ${InstanceTypes[type] ?? "Unknown"}`);
	} else if (sub === "show") {
		const instanceId = intr.options.getInteger("instance", true);
		const instance = await instances.getInstance(instanceId);

		if (!instance) {
			intr.editReply(`${emXMark} Instance #${instanceId} was not found`);
			return;
		}

		intr.editReply({ embeds: [instance.toEmbed()] });

		intr.logger.log(`Viewed instance #${instanceId}`);
	} else if (sub === "edit") {
		const referenceId = intr.options.getInteger("reference-id");
		const instanceId = intr.options.getInteger("instance-id", true);
		const duration = intr.options.getString("duration");
		const executor = intr.options.getUser("executor");
		const reason = intr.options.getString("reason");
		const target = intr.options.getUser("target");
		const time = intr.options.getString("time");

		const oldInstance = await instances.getInstance(instanceId);
		if (!oldInstance) {
			intr.editReply(`${emXMark} Instance #${instanceId} was not found`);
			return;
		}

		const oldData = oldInstance.data;
		let newData: Partial<InstanceData> = {};

		if (executor) {
			newData.executorTag = executor.tag;
			newData.executorId = executor.id;
		}
		if (target) {
			newData.targetTag = target.tag;
			newData.targetId = target.id;
		}
		if (referenceId) newData.referenceId = referenceId;
		if (duration) newData.duration = ms(duration);
		if (reason) newData.reason = reason;
		if (time) newData.timestamp = Date.now() - ms(time);

		const data = Object.assign({}, oldData, newData);
		data.edited = true;

		const newInstance = await instances.editInstance(instanceId, data);
		if (!newInstance) {
			intr.editReply(`${emError} Something went wrong with editing instance #${instanceId}`);
			return;
		}

		intr.editReply({ embeds: [newInstance.toEmbed()] });

		intr.logger.log(`Manually edited instance #${instanceId}`);
	}
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
