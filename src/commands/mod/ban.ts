import { oneLine } from "common-tags";
import {
	ApplicationCommandOptionType,
	PermissionsBitField,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import { CaseTypes } from "../../constants/database.js";
import { MAX_AUDIT_REASON_LEN } from "../../constants/index.js";
import CaseManager from "../../database/CaseManager.js";
import { e } from "../../emojis/index.js";
import type Logger from "../../loggers/index.js";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import { bold } from "../../utils/discordMarkdown.js";
import { appendPrefixAndSuffix, createList } from "../../utils/index.js";
import { reason, user } from "./noread.sharedCommandOptions.js";

const options: Partial<CommandOptions> = { private: true };

const data: ChatInputApplicationCommandData = {
	name: "ban",
	description: "Bans a user off this server",
	options: [
		user(true),
		reason("ban"),
		{
			name: "days-of-pruning",
			description: "Days to prune user's messages (1 day)",
			type: ApplicationCommandOptionType.Integer,
			choices: [
				{
					name: "No prune",
					value: 0
				},
				{
					name: "1 day (default)",
					value: 1
				},
				{
					name: "2 days",
					value: 2
				},
				{
					name: "3 days",
					value: 3
				},
				{
					name: "4 days",
					value: 4
				},
				{
					name: "5 days",
					value: 5
				},
				{
					name: "6 days",
					value: 6
				},
				{
					name: "7 days",
					value: 7
				}
			]
		}
	]
};

function execute(intr: ChatInputCommandInteraction<"cached">, logger: Logger) {
	const targetMember = intr.options.getMember("user");
	const target = intr.options.getUser("user", true);
	const reason = intr.options.getString("reason");
	const days = intr.options.getInteger("days") ?? 1;

	if (
		!intr.guild.members.me?.permissions.has(
			PermissionsBitField.Flags.BanMembers
		)
	) {
		intr.editReply(e`{cross} I don't have permissions to ban users`);

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

	if (targetMember && !targetMember.bannable) {
		intr.editReply(e`{cross} I cannot ban the user to target`);

		return;
	}

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? appendPrefixAndSuffix(reason, {
				maxLen: MAX_AUDIT_REASON_LEN,
				suffix: auditLogSuffix
		  })
		: `By ${intr.user.tag} ${intr.user.id}`;

	const info = createList({
		"Days pruned": days ? `${days} days` : "None",
		"Reason": reason ?? "No reason provided",
		"Target": `${target.tag} (${target.id})`
	});

	const query = oneLine(
		e`
			{warning} Are you sure you want to
			ban ${bold(target.tag)} (${target.id})?\n\n${info}
		`
	);

	const collector = new ConfirmationButtons({
		authorId: intr.user.id,
		inverted: true
	})
		.setInteraction(intr)
		.setQuery(query);

	collector
		.start({ noReply: true })
		.then(() => {
			intr.guild.members
				.ban(target, {
					reason: auditLogReason,
					deleteMessageDays: days
				})
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
							targetTag: target.tag,
							type: CaseTypes.Ban
						},
						true
					);

					logger.logInteraction(
						`Banned ${target.tag} (${target.id}) ${
							reason
								? `with reason: "${reason}"`
								: "with no reason provided"
						}`
					);

					intr.editReply({
						content: `${oneLine(e`
							{check} Successfully ${bold`banned ${target.tag}`}
							(${target.id}) in case ${bold`#${case_.id}
						`}`)}\n\n${info}`,
						components: []
					});
				})
				.catch(() => {
					intr.editReply({
						content: e`{cross} Failed to ban ${target.tag} (${target.id})\n\n${info}`,
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
