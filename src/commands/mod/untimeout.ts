import {
	PermissionsBitField,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import { CaseTypes } from "../../constants/database.js";
import { MAX_AUDIT_REASON_LEN } from "../../constants/index.js";
import CaseManager from "../../database/CaseManager.js";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import Util from "../../utils/index.js";
import { reason, user } from "./noread.sharedCommandOptions.js";

const options: Partial<CommandOptions> = { wip: true };

const data: ChatInputApplicationCommandData = {
	name: "untimeout",
	description: "Removes the time-out of a user",
	options: [
		user(true), //
		reason("time-out")
	]
};

function execute(intr: ChatInputCommandInteraction<"cached">) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");
	const expiration = target?.communicationDisabledUntilTimestamp;
	const emojis = intr.client.maserEmojis;

	if (
		!intr.guild.members.me?.permissions.has(
			PermissionsBitField.Flags.ModerateMembers
		)
	) {
		intr.editReply(
			`${emojis.cross} I don't have permissions to untimeout users`
		);

		return;
	}

	if (!target) {
		intr.editReply(
			`${emojis.cross} The user to target was not found in this server`
		);

		return;
	}

	if (!expiration) {
		intr.editReply(
			`${emojis.cross} The user to target is not in a timeout`
		);

		return;
	}

	if (target.id === intr.guild.ownerId) {
		intr.editReply(
			`${emojis.cross} The user to target is the owner of this server`
		);

		return;
	}

	const info = Util.createList({
		"**Expiration**": Util.fullDate(expiration),
		"**Reason**": reason ?? "No reason provided",
		"**Target**": `${target.user.tag} (${target} ${target.id})`
	});

	const query = `${emojis.warning} Are you sure you want to untimeout **${target.user.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({ authorId: intr.user.id }) //
		.setInteraction(intr)
		.setQuery(query);

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, {
				suffix: auditLogSuffix
		  })
		: `By ${intr.user.tag} ${intr.user.id}`;

	collector
		.start({ noReply: true })
		.then(() => {
			target
				.disableCommunicationUntil(null, auditLogReason)
				.then(async () => {
					const cases = new CaseManager(intr.client, intr.guildId);

					const case_ = await cases.createCase(
						{
							expirationTimestamp: null,
							referencedCaseId: null,
							logMessageURL: null,
							targetTag: target.user.tag,
							targetId: target.id,
							modTag: intr.user.tag,
							reason,
							modId: intr.user.id,
							type: CaseTypes.Untimeout
						},
						true
					);

					intr.editReply({
						content:
							`${emojis.check} Successfully **removed timeout** on **${target.user.tag}** (${target.id}) ` +
							`in case **#${case_.id}**\n\n${info}`,
						components: []
					});

					intr.logger.log(
						`Removed time-out of ${target.user.tag} (${target.id}) with reason: ${reason}`
					);
				})
				.catch(() => {
					intr.editReply({
						content:
							`${emojis.cross} I failed to remove timeout ` +
							`of ${target.user.tag} (${target.id})\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({
				content: `${emojis.check} Gotcha. Command cancelled`,
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
