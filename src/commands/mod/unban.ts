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
	name: "unban",
	description: "Unbans a user",
	options: [user(true), reason("unban")]
};

async function execute(intr: ChatInputCommandInteraction<"cached">) {
	const target = intr.options.getUser("user", true);
	const reason = intr.options.getString("reason");

	if (
		!intr.guild.members.me?.permissions.has(
			PermissionsBitField.Flags.BanMembers
		)
	) {
		intr.editReply(e`{cross} I don't have permissions to unban users`);

		return;
	}

	const ban = await intr.guild.bans.fetch(target.id).catch(() => null);

	if (!ban) {
		intr.editReply(e`{cross} The user to target is not banned`);

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
		"**Target**": `${target.tag} (${target.id})`
	});

	const query = oneLine(e`
		{warning} Are you sure you want to unban
		**${target.tag}** (${target.id})?\n\n${info}
	`);

	const collector = new ConfirmationButtons({ authorId: intr.user.id }) //
		.setInteraction(intr)
		.setQuery(query);

	collector
		.start({ noReply: true })
		.then(() => {
			intr.guild.members
				.unban(target.id, auditLogReason)
				.then(async () => {
					const cases = new CaseManager(intr.client, intr.guildId);

					const case_ = await cases.createCase(
						{
							expirationTimestamp: null,
							referencedCaseId: null,
							logMessageURL: null,
							targetTag: target.tag,
							targetId: target.id,
							modTag: intr.user.tag,
							reason,
							modId: intr.user.id,
							type: CaseTypes.Unban
						},
						true
					);

					intr.logger.log(
						`Unbanned ${target.tag} (${target.id}) ${
							reason
								? `with reason: "${reason}"`
								: "with no reason provided"
						}`
					);

					intr.editReply({
						content: oneLine(e`
							{check} Successfully **unbanned ${target.tag}**
							(${target.id}) in case **#${case_.id}**\n\n${info}
						`),
						components: []
					});
				})
				.catch(() => {
					intr.editReply({
						content: e`{cross} Failed to unban ${target.tag} (${target.id})\n\n${info}`,
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
