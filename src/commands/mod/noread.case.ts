/*import {
	ApplicationCommandOptionType,
	type AutocompleteInteraction,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import ms from "ms";
import { CaseTypes } from "../../constants/database.js";
import CaseManager from "../../database/CaseManager.js";
import { CreateCaseData, type CaseData } from "../../typings/database.js";
import { type Command, type CommandOptions } from "../../typings/index.js";

const options: Partial<CommandOptions> = { private: true };

// stupid enum shenanigans
const TYPE_CHOICES = Object.entries(CaseTypes)
	.filter(([, value]) => typeof value === "number")
	.map(([key, value]) => ({
		name: key,
		value
	}));
// { name: "Ban", value: 0 } etc.

const data: ChatInputApplicationCommandData = {
	name: "case",
	description: "Manages this server's cases",
	options: [
		{
			name: "create",
			description: "Manually create a case",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "executor",
					description: "The executor of this case",
					type: ApplicationCommandOptionType.User,
					required: true
				},
				{
					name: "type",
					description: "The type of case",
					type: ApplicationCommandOptionType.Integer,
					choices: TYPE_CHOICES,
					required: true
				},
				{
					name: "reason",
					description: "The reason for this case",
					type: ApplicationCommandOptionType.String
				},
				{
					name: "reference-id",
					description: "The reference ID for this case",
					type: ApplicationCommandOptionType.String,
					autocomplete: true
				},
				{
					name: "target",
					description: "The target of this case",
					type: ApplicationCommandOptionType.User
				},
				{
					name: "time",
					description:
						'The time since this case, e.g. "5min" (Current time)',
					type: ApplicationCommandOptionType.String
				},
				{
					name: "duration",
					description: 'The duration of this case, e.g. "5min"',
					type: ApplicationCommandOptionType.String
				}
			]
		},
		{
			name: "edit",
			description: "Edit a case",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "case",
					description: "The ID of the case to edit",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: true
				},
				{
					name: "executor",
					description: "The executor of this case",
					type: ApplicationCommandOptionType.User
				},
				{
					name: "reason",
					description: "The reason for this case",
					type: ApplicationCommandOptionType.String
				},
				{
					name: "reference-id",
					description: "The case to reference's ID",
					type: ApplicationCommandOptionType.String,
					autocomplete: true
				},
				{
					name: "target",
					description: "The target of this case",
					type: ApplicationCommandOptionType.User
				},
				{
					name: "time",
					description:
						'The time since this case. Accepts relative times ("5 min"). Default is current time',
					type: ApplicationCommandOptionType.String
				},
				{
					name: "duration",
					description:
						'The duration of this case. Accepts timestamps and relative times ("5min")',
					type: ApplicationCommandOptionType.String
				}
			]
		},
		{
			name: "show",
			description: "Show a case",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "case",
					description: "The ID of the case to show",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: true
				}
			]
		},
		{
			name: "delete",
			description: "Delete a case",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "case",
					description: "The ID of the case to delete",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: true
				}
			]
		}
	]
};

async function execute(
	intr:
		| AutocompleteInteraction<"cached">
		| ChatInputCommandInteraction<"cached">
) {
	const sub = intr.options.getSubcommand();
	const cases = new CaseManager(intr.client, intr.guildId);

	await cases.initialise();

	if (intr.isAutocomplete()) {
		const getData = async (focusedRaw?: number) => {
			const focused = focusedRaw ?? (await cases.getLatestId()) ?? 1;
			// ensures offset will never be under 0
			const offset = focused <= 3 ? 0 : focused - 3;
			const data = await cases.getCaseDataWithinRange(offset);

			const getName = (data: CaseData) => {
				const id = data.caseId;

				const emoji =
					id === focused ? "✨" : id > focused ? "🔸" : "🔹";

				let str = `${emoji} #${id} ${CaseTypes[data.type]}`;

				if (data.targetTag) {
					str += ` - ${data.targetTag}`;
				}

				return str;
			};

			return data
				?.sort((a, b) => {
					// Makes the focused value always be atop
					if (a.caseId === focused) {
						return -1;
					}

					if (b.caseId === focused) {
						return 1;
					}

					// high -> low
					return b.caseId - a.caseId;
				})
				.map((data) => ({
					name: getName(data),
					value: `${data.caseId}`
				}));
		};

		const emptyResponse = {
			name: "😴 Whoa so empty — There are no cases",
			value: "0"
		};

		const focused = Number(intr.options.getFocused()) || undefined;
		const response = (await getData(focused)) ?? [emptyResponse];

		intr.respond(response);

		return;
	}

	const getIdOptionValue = (option: string) => {
		const value = intr.options.getString(option)?.replaceAll(/\D*/ /*g, "");

		if (!value) {
			return null;
		}

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

		const data: CreateCaseData = {
			expirationTimestamp: duration
				? new Date(Date.now() + duration)
				: null,
			referencedCaseId: reference,
			logMessageURL: null,
			targetTag: target?.tag ?? null,
			targetId: target?.id ?? null,
			modTag: executor.tag,
			reason,
			modId: executor.id,
			type
		};

		const case_ = await cases.createCase(data, true);

		intr.editReply({ embeds: [await case_.toEmbed()] });

		intr.logger.log(
			`Manually created new case of type ${CaseTypes[type] ?? "Unknown"}`
		);
	} else if (sub === "show") {
		const caseId = getIdOptionValue("case");

		if (!caseId) {
			intr.editReply(e`{cross} Provided ID is invalid: ${caseId}`);

			return;
		}

		const case_ = await cases.getCase(caseId);

		if (!case_) {
			intr.editReply(e`{cross} case #${caseId} was not found`);

			return;
		}

		intr.editReply({ embeds: [await case_.toEmbed()] });

		intr.logger.log(`Viewed case #${caseId}`);
	} else if (sub === "edit") {
		const referenceId = getIdOptionValue("reference-id");
		const caseId = getIdOptionValue("case-id");
		const duration = intr.options.getString("duration");
		const executor = intr.options.getUser("executor");
		const reason = intr.options.getString("reason");
		const target = intr.options.getUser("target");
		const time = intr.options.getString("time");

		if (!caseId) {
			intr.editReply(e`{cross} Provided ID is invalid: ${caseId}`);

			return;
		}

		const oldcase = await cases.getCase(caseId);

		if (!oldcase) {
			intr.editReply(e`{cross} case #${caseId} was not found`);

			return;
		}

		const oldData = oldcase.data;
		const newData: Partial<CaseData> = {};

		if (executor) {
			newData.executorTag = executor.tag;

			newData.executorId = executor.id;
		}

		if (target) {
			newData.targetTag = target.tag;

			newData.targetId = target.id;
		}

		if (referenceId) {
			newData.referenceId = referenceId;
		}

		if (duration) {
			newData.duration = ms(duration);
		}

		if (reason) {
			newData.reason = reason;
		}

		if (time) {
			newData.timestamp = Date.now() - ms(time);
		}

		const data = Object.assign({}, oldData, newData); // merges the objects

		data.timestamp = Date.now();

		data.edited = true;

		const newcase = await cases.editCase(caseId, data);

		if (!newcase) {
			intr.editReply(
				e`{cross} Something went wrong with editing case #${caseId}`
			);

			return;
		}

		await newcase.getReference();

		await newcase.updateLogMessage();

		intr.editReply({
			content: e`{check} Successfully edited case #${caseId}`,
			embeds: [newcase.toEmbed()]
		});

		intr.logger.log(`Manually edited case #${caseId}`);
	} else if (sub === "delete") {
		const caseId = getIdOptionValue("case");

		if (!caseId) {
			intr.editReply(e`{cross} Provided ID is invalid: ${caseId}`);

			return;
		}

		const case_ = await cases.getCase(caseId);

		if (!case_) {
			intr.editReply(e`{cross} case #${caseId} was not found`);

			return;
		}

		await cases.deleteCase(caseId);

		case_.deleted = true;

		await case_.updateLogMessage();

		intr.editReply({
			content: e`{check} Successfully deleted case #${caseId}`,
			embeds: [case_.toEmbed()]
		});

		intr.logger.log(`Deleted case #${caseId}`);
	}
}

export const getCommand = () =>
	({
		data,
		options,
		execute
	} as Partial<Command>);
*/
