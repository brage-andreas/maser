import { oneLine, stripIndents } from "common-tags";
import {
	ApplicationCommandOptionType,
	PermissionsBitField,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import ms from "ms";
import { CaseTypes } from "../../constants/database.js";
import { DURATIONS, MAX_AUDIT_REASON_LEN } from "../../constants/index.js";
import CaseManager from "../../database/CaseManager.js";
import { e } from "../../emojis/index.js";
import type Logger from "../../loggers/index.js";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import {
	appendPrefixAndSuffix,
	createList,
	fullDate
} from "../../utils/index.js";
import { reason, user } from "./noread.sharedCommandOptions.js";

const options: Partial<CommandOptions> = { wip: true };

const data: ChatInputApplicationCommandData = {
	name: "timeout",
	description: "Timeout a user for a given time",
	options: [
		user(true),
		reason("timeout"),
		{
			name: "duration",
			type: ApplicationCommandOptionType.Integer,
			description: "The duration for this timeout (3 hours)",
			choices: [
				{
					name: "3 hours (default)",
					value: DURATIONS.THREE_HRS
				},
				{
					name: "15 minutes",
					value: DURATIONS.FIFTEEN_MIN
				},
				{
					name: "45 minutes",
					value: DURATIONS.FOURTY_FIVE_MIN
				},
				{
					name: "1,5 hours",
					value: DURATIONS.ONE_AND_HALF_HRS
				},
				{
					name: "6 hours",
					value: DURATIONS.SIX_HRS
				},
				{
					name: "12 hours",
					value: DURATIONS.TWELVE_HRS
				},
				{
					name: "1 day",
					value: DURATIONS.ONE_DAY
				},
				{
					name: "3 days",
					value: DURATIONS.THREE_DAYS
				},
				{
					name: "7 days",
					value: DURATIONS.THREE_DAYS
				}
			]
		}
	]
};

function execute(intr: ChatInputCommandInteraction<"cached">, logger: Logger) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");
	const duration = intr.options.getInteger("duration") ?? DURATIONS.THREE_HRS;
	const expiration = Date.now() + duration;

	if (
		!intr.guild.members.me?.permissions.has(
			PermissionsBitField.Flags.ModerateMembers
		)
	) {
		intr.editReply(e`{cross} I do not have permissions to timeout users`);

		return;
	}

	if (!target) {
		intr.editReply(e`{cross} The user was not found in this server`);

		return;
	}

	if (target.id === intr.user.id) {
		intr.editReply(e`{cross} You cannot do this action on yourself`);

		return;
	}

	if (target.id === intr.client.user.id) {
		intr.editReply(e`{cross} I cannot do this action on myself`);

		return;
	}

	if (target.id === intr.guild.ownerId) {
		intr.editReply(e`{cross} The user is the owner of this server`);

		return;
	}

	const inTimeout =
		Date.now() < (target.communicationDisabledUntilTimestamp ?? 0);

	const info = createList({
		"**Duration**": ms(duration, { long: true }),
		"**Expiration**": fullDate(expiration),
		"**Reason**": reason ?? "No reason provided",
		"**Target**": `${target.user.tag} (${target.id})`
	});

	const overrideStr = oneLine(e`
		{warning} This will override their
		current timeout, set to expire
		${fullDate(target.communicationDisabledUntilTimestamp!)}.
	`);

	const query = stripIndents`
		Are you sure you want to timeout **${target.user.tag}** (${target.id})?
		${inTimeout ? `\n${overrideStr}` : ""}
		
		${info}
	`;

	const collector = new ConfirmationButtons({
		authorId: intr.user.id,
		inverted: true
	})
		.setInteraction(intr)
		.setQuery(query);

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? appendPrefixAndSuffix(reason, {
				maxLen: MAX_AUDIT_REASON_LEN,
				suffix: auditLogSuffix
		  })
		: `By ${intr.user.tag} ${intr.user.id}`;

	collector
		.start({ noReply: true })
		.then(() => {
			target
				.disableCommunicationUntil(
					Date.now() + duration,
					auditLogReason
				)
				.then(async () => {
					const cases = new CaseManager(intr.client, intr.guildId);

					const case_ = await cases.createCase(
						{
							expirationTimestamp: new Date(
								Date.now() + duration
							),
							logMessageURL: null,
							modId: intr.user.id,
							modTag: intr.user.tag,
							reason,
							referencedCaseId: null,
							targetId: target.id,
							targetTag: target.user.tag,
							type: CaseTypes.Timeout
						},
						true
					);

					intr.editReply({
						content: `${oneLine(e`
							{check} Successfully **timed out ${target.user.tag}**
							(${target.id}) in case **#${case_.id}**
						`)}\n\n${info}`,
						components: []
					});

					logger.logInteraction(oneLine`
						Timed out ${target.user.tag} (${target.id}) for
						${ms(duration, { long: true })} with reason: ${reason}
					`);
				})
				.catch(() => {
					intr.editReply({
						content: e`{cross} I failed to time out ${target.user.tag} (${target.id})\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({
				content: e`{check} Gotcha. Command cancelled`,
				components: []
			});
		});
}

export const getCommand = () =>
	({
		options,
		data,
		execute
	} as Partial<Command>);
