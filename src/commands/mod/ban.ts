import {
	ApplicationCommandOptionType,
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
import { REASON, USER } from "./noread.methods.js";

const options: Partial<CommandOptions> = { private: true };

const data: ChatInputApplicationCommandData = {
	name: "ban",
	description: "Bans a user off this server",
	options: [
		USER(true),
		REASON("ban"),
		{
			name: "days",
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

function execute(intr: ChatInputCommandInteraction<"cached">) {
	const targetMember = intr.options.getMember("user");
	const target = intr.options.getUser("user", true);
	const reason = intr.options.getString("reason");
	const days = intr.options.getInteger("days") ?? 1;
	const emojis = intr.client.maserEmojis;

	if (!intr.guild.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
		intr.editReply(`${emojis.cross} I don't have permissions to ban users`);

		return;
	}

	if (target.id === intr.user.id) {
		intr.editReply(`${emojis.cross} You cannot do this action on yourself`);

		return;
	}

	if (target.id === intr.client.user.id) {
		intr.editReply(`${emojis.cross} I cannot do this action on myself`);

		return;
	}

	if (target.id === intr.guild.ownerId) {
		intr.editReply(
			`${emojis.cross} The user to target is the owner of this server`
		);

		return;
	}

	if (targetMember && !targetMember.bannable) {
		intr.editReply(`${emojis.cross} I cannot ban the user to target`);

		return;
	}

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, {
				suffix: auditLogSuffix
		  })
		: `By ${intr.user.tag} ${intr.user.id}`;

	const info =
		`• **Target**: ${target.tag} (${target} ${target.id})\n` +
		`• **Reason**: ${reason ?? "No reason provided"}\n` +
		`• **Days pruned**: ${days ? `${days} days` : "No pruning"}`;

	const query = `${emojis.warning} Are you sure you want to ban **${target.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({
		authorId: intr.user.id,
		inverted: true
	}) //
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
					const cases = await new CaseManager(
						intr.client,
						intr.guildId
					).initialise();

					const case_ = await cases.createCase(
						{
							executorAvatar: intr.member.displayAvatarURL(),
							executorTag: intr.user.tag,
							executorId: intr.user.id,
							targetTag: target.tag,
							targetId: target.id,
							reason: reason ?? undefined,
							type: CaseTypes.Ban
						},
						true
					);

					intr.logger.log(
						`Banned ${target.tag} (${target.id}) ${
							reason
								? `with reason: "${reason}"`
								: "with no reason"
						}`
					);

					intr.editReply({
						content:
							`${emojis.check} Successfully **banned ${target.tag}** (${target.id}) ` +
							`in case **#${case_.id}**\n\n${info}`,
						components: []
					});
				})
				.catch(() => {
					intr.editReply({
						content: `${emojis.cross} Failed to ban ${target.tag} (${target.id})\n\n${info}`,
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
		data,
		options,
		execute
	} as Partial<Command>);
