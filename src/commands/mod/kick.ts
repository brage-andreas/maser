import { oneLine } from "common-tags";
import {
	PermissionsBitField,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import { CaseTypes } from "../../constants/database.js";
import { MAX_AUDIT_REASON_LEN } from "../../constants/index.js";
import CaseManager from "../../database/CaseManager.js";
import { e } from "../../emojis/index.js";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import Util from "../../utils/index.js";
import { reason, user } from "./noread.sharedCommandOptions.js";

const options: Partial<CommandOptions> = { private: true };

const data: ChatInputApplicationCommandData = {
	name: "kick",
	description: "Kicks a user off this server",
	options: [user(true), reason("kick")]
};

function execute(intr: ChatInputCommandInteraction<"cached">) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");

	if (!target) {
		intr.editReply(
			e`{cross} The user to target was not found in this server`
		);

		return;
	}

	if (
		!intr.guild.members.me?.permissions.has(
			PermissionsBitField.Flags.KickMembers
		)
	) {
		intr.editReply(e`{cross} I don't have permissions to kick users`);

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
		intr.editReply(
			e`{cross} The user to target is the owner of this server`
		);

		return;
	}

	if (!target.kickable) {
		intr.editReply(e`{cross} I cannot kick the user to target`);

		return;
	}

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, {
				suffix: auditLogSuffix
		  })
		: `By ${intr.user.tag} ${intr.user.id}`;

	const info = Util.createList({
		"**Reason**": reason ?? "No reason provided",
		"**Target**": `${target.user.tag} (${target.id})`
	});

	const query = oneLine(e`
		{warning} Are you sure you want to kick
		**${target.user.tag}** (${target.id})?\n\n${info}
	`);

	const collector = new ConfirmationButtons({
		authorId: intr.user.id,
		inverted: true
	}) //
		.setInteraction(intr)
		.setQuery(query);

	collector
		.start({ noReply: true })
		.then(() => {
			target
				.kick(auditLogReason)
				.then(async () => {
					const cases = new CaseManager(intr.client, intr.guildId);

					const case_ = await cases.createCase(
						{
							expirationTimestamp: null,
							logMessageURL: null,
							modId: intr.user.id,
							modTag: intr.user.tag,
							reason,
							referencedCaseId: null,
							targetId: target.id,
							targetTag: target.user.tag,
							type: CaseTypes.Kick
						},
						true
					);

					intr.logger.log(
						`Kicked ${target.user.tag} (${target.id}) ${
							reason
								? `with reason: "${reason}"`
								: "with no reason provided"
						}`
					);

					intr.editReply({
						content: `${oneLine(e`
							{check} Successfully **kicked ${target.user.tag}**
							(${target.id}) in case **#${case_.id}**
						`)}\n\n${info}`,
						components: []
					});
				})
				.catch(() => {
					intr.editReply({
						content: e`{cross} Failed to kick ${target.user.tag} (${target.id})\n\n${info}`,
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
		data,
		options,
		execute
	} as Partial<Command>);
