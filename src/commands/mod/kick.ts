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
import { REASON, USER } from "./noread.methods.js";

const options: Partial<CommandOptions> = {
	private: true
};

const data: ChatInputApplicationCommandData = {
	name: "kick",
	description: "Kicks a user off this server",
	options: [USER(true), REASON("kick")]
};

function execute(intr: ChatInputCommandInteraction<"cached">) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");
	const emojis = intr.client.maserEmojis;

	if (!target) {
		intr.editReply(`${emojis.cross} The user to target was not found in this server`);

		return;
	}

	if (!intr.guild.me?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
		intr.editReply(`${emojis.cross} I don't have permissions to kick users`);

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
		intr.editReply(`${emojis.cross} The user to target is the owner of this server`);

		return;
	}

	if (!target.kickable) {
		intr.editReply(`${emojis.cross} I cannot kick the user to target`);

		return;
	}

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, { suffix: auditLogSuffix })
		: `By ${intr.user.tag} ${intr.user.id}`;

	const info =
		`• **Reason**: ${reason ?? "No reason provided"}\n` +
		`• **Target**: ${target.user.tag} (${target} ${target.id})`;

	const query = `${emojis.warning} Are you sure you want to kick **${target.user.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({ authorId: intr.user.id, inverted: true }) //
		.setInteraction(intr)
		.setQuery(query);

	collector
		.start({ noReply: true })
		.then(() => {
			target
				.kick(auditLogReason)
				.then(async () => {
					const cases = await new CaseManager(intr.client, intr.guildId).initialise();

					const case_ = await cases.createCase({
						executorAvatar: intr.member.displayAvatarURL(),
						executorTag: intr.user.tag,
						executorId: intr.user.id,
						targetTag: target.user.tag,
						targetId: target.id,
						reason: reason ?? undefined,
						type: CaseTypes.Kick
					});

					intr.logger.log(
						`Kicked ${target.user.tag} (${target.id}) ${
							reason ? `with reason: "${reason}"` : "with no reason"
						}`
					);

					intr.editReply({
						content:
							`${emojis.check} Successfully **kicked ${target.user.tag}** (${target.id})` +
							`in case **#${case_.id}**\n\n${info}`,
						components: []
					});
				})
				.catch(() => {
					intr.editReply({
						content: `${emojis.cross} Failed to kick ${target.user.tag} (${target.id})\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({ content: `${emojis.check} Gotcha. Command cancelled`, components: [] });
		});
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
