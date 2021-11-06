import type { CommandInteraction, Command, InstanceData } from "../../typings.js";
import type { ApplicationCommandSubCommandData, ChatInputApplicationCommandData } from "discord.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import InstanceManager from "../../database/src/instance/InstanceManager.js";
import ms from "ms";

const options = {
	private: true
};

const dataOptions = [
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
		choices: [
			{
				name: "Ban",
				value: 0
			}
		],
		required: true
	},
	{
		name: "reason",
		description: "The reason for this instance",
		type: ApplicationCommandOptionTypes.STRING
	},
	{
		name: "target",
		description: "The target of this instance",
		type: ApplicationCommandOptionTypes.USER
	},
	{
		name: "time",
		description: 'The time since this instance. Accepts relative times ("5 min"). Default is current time',
		type: ApplicationCommandOptionTypes.STRING
	},
	{
		name: "duration",
		description: 'The duration of this instance. Accepts timestamps and relative times ("5min")',
		type: ApplicationCommandOptionTypes.STRING
	}
] as ApplicationCommandSubCommandData["options"];

const data: ChatInputApplicationCommandData = {
	name: "instance",
	description: "Manages this server's instances",
	options: [
		{
			name: "create",
			description: "Manually create an instance",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: dataOptions
		},
		{
			name: "edit",
			description: "Edit an instance",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: dataOptions
		},
		{
			name: "show",
			description: "Show an instance",
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			options: [
				{
					name: "instance",
					description: "The id of the instance to show",
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
					description: "The id of the instance to delete",
					type: ApplicationCommandOptionTypes.INTEGER,
					required: true
				}
			]
		}
	]
};

async function execute(intr: CommandInteraction) {
	const sub = intr.options.getSubcommand();

	const { emXMark } = intr.client.systemEmojis;
	const instances = new InstanceManager(intr.client, intr.guildId);

	if (sub === "create") {
		const duration = intr.options.getString("duration");
		const executor = intr.options.getUser("executor", true);
		const reason = intr.options.getString("reason");
		const target = intr.options.getUser("target");
		const type = intr.options.getInteger("type", true);
		const time = intr.options.getString("time");

		const data: Partial<InstanceData> = {
			executorTag: executor.tag,
			executorId: executor.id,
			targetTag: target?.tag,
			duration: duration ? ms(duration) : undefined,
			targetId: target?.id,
			guildId: intr.guildId,
			reason: reason ?? undefined,
			timestamp: time ? ms(`-${time}`) : undefined,
			type
		};

		const instance = await instances.createInstance(data);
		intr.editReply({ embeds: [instance.toEmbed()] });

		intr.logger.log(`Manually created new instance of type ${type}`);
	} else if (sub === "show") {
		const instanceId = intr.options.getInteger("instance", true);
		const instance = instances.getInstance(`${instanceId}`);

		if (!instance) {
			intr.editReply(`${emXMark} I found no instance with the id \`${instanceId}\``);
			return;
		}

		intr.logger.log();
	}
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
