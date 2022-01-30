import {
	type AutocompleteInteraction,
	type ChatInputApplicationCommandData,
	type CommandInteraction
} from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import ms from "ms";
import { InstanceTypes } from "../../constants/database.js";
import InstanceManager from "../../database/InstanceManager.js";
import type { InstanceData } from "../../typings/database.js";
import { type Command, type CommandOptions } from "../../typings/index.js";

const options: Partial<CommandOptions> = {
	private: true
};

// stupid enum shenanigans
const TYPE_CHOICES = Object.entries(InstanceTypes)
	.filter(([, value]) => typeof value === "number")
	.map(([key, value]) => ({ name: key, value }));
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
					type: ApplicationCommandOptionTypes.STRING,
					autocomplete: true
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
					type: ApplicationCommandOptionTypes.STRING,
					autocomplete: true,
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
					type: ApplicationCommandOptionTypes.STRING,
					autocomplete: true
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
					type: ApplicationCommandOptionTypes.STRING,
					autocomplete: true,
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
					type: ApplicationCommandOptionTypes.STRING,
					autocomplete: true,
					required: true
				}
			]
		}
	]
};

async function execute(intr: AutocompleteInteraction<"cached"> | CommandInteraction<"cached">) {
	const sub = intr.options.getSubcommand();
	const emojis = intr.client.maserEmojis;
	const instances = new InstanceManager(intr.client, intr.guildId);

	await instances.initialise();

	if (intr.isAutocomplete()) {
		const getData = async (focusedRaw?: number) => {
			// doesn't infer type right whilst just using param
			const focused = focusedRaw ?? (await instances.getLatestId()) ?? 1;
			// ensures offset will never be under 0
			const offset = focused <= 3 ? 0 : focused - 3;
			const data = await instances.getInstanceDataWithinRange(offset);

			const getName = (data: InstanceData) => {
				const id = data.instanceId;
				const emoji = id === focused ? "✨" : id > focused ? "🔸" : "🔹";
				let str = `${emoji} #${id} - ${InstanceTypes[data.type]}`;

				if (data.targetTag) str += ` on ${data.targetTag}`;

				return str;
			};

			return data
				?.sort((a, b) => {
					// Makes the focused value always be atop
					if (a.instanceId === focused) return -1;

					if (b.instanceId === focused) return 1;

					// high -> low
					return b.instanceId - a.instanceId;
				})
				.map((data) => ({
					name: getName(data),
					value: `${data.instanceId}`
				}));
		};

		const emptyResponse = { name: "😴 Whoa so empty—there are no instances", value: "0" };
		const focused = Number(intr.options.getFocused()) || undefined;
		const response = (await getData(focused)) ?? [emptyResponse];

		intr.respond(response);

		return;
	}

	const getIdOptionValue = (option: string) => {
		const value = intr.options.getString(option)?.replaceAll(/\D*/g, "");

		if (!value) return null;

		return parseInt(value) || null;
	};

	if (sub === "create") {
		const reference = getIdOptionValue("reference-id");
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
			type,
			url: undefined
		};

		const instance = await instances.createInstance(data);

		await instance.getReference();

		intr.editReply({ embeds: [instance.toEmbed()] });

		intr.logger.log(`Manually created new instance of type ${InstanceTypes[type] ?? "Unknown"}`);
	} else if (sub === "show") {
		const instanceId = getIdOptionValue("instance");

		if (!instanceId) {
			intr.editReply(`${emojis.cross} Provided ID is invalid: ${instanceId}`);

			return;
		}

		const instance = await instances.getInstance(instanceId);

		if (!instance) {
			intr.editReply(`${emojis.cross} Instance #${instanceId} was not found`);

			return;
		}

		await instance.getReference();

		intr.editReply({ embeds: [instance.toEmbed()] });

		intr.logger.log(`Viewed instance #${instanceId}`);
	} else if (sub === "edit") {
		const referenceId = getIdOptionValue("reference-id");
		const instanceId = getIdOptionValue("instance-id");
		const duration = intr.options.getString("duration");
		const executor = intr.options.getUser("executor");
		const reason = intr.options.getString("reason");
		const target = intr.options.getUser("target");
		const time = intr.options.getString("time");

		if (!instanceId) {
			intr.editReply(`${emojis.cross} Provided ID is invalid: ${instanceId}`);

			return;
		}

		const oldInstance = await instances.getInstance(instanceId);

		if (!oldInstance) {
			intr.editReply(`${emojis.cross} Instance #${instanceId} was not found`);

			return;
		}

		const oldData = oldInstance.data;
		const newData: Partial<InstanceData> = {};

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

		const data = Object.assign({}, oldData, newData); // merges the objects

		data.timestamp = Date.now();

		data.edited = true;

		const newInstance = await instances.editInstance(instanceId, data);

		if (!newInstance) {
			intr.editReply(`${emojis.cross} Something went wrong with editing instance #${instanceId}`);

			return;
		}

		await newInstance.getReference();

		intr.editReply({
			content: `${emojis.check} Successfully edited instance #${instanceId}`,
			embeds: [newInstance.toEmbed()]
		});

		intr.logger.log(`Manually edited instance #${instanceId}`);
	}
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
