import {
	PermissionsBitField,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import { InstanceTypes } from "../../constants/database.js";
import { MAX_AUDIT_REASON_LEN } from "../../constants/index.js";
import InstanceManager from "../../database/InstanceManager.js";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import Util from "../../utils/index.js";
import { REASON, USER } from "./noread.methods.js";

const options: Partial<CommandOptions> = {
	private: true
};

const data: ChatInputApplicationCommandData = {
	name: "unban",
	description: "Unbans a user",
	options: [USER(true), REASON("unban")]
};

async function execute(intr: ChatInputCommandInteraction<"cached">) {
	const target = intr.options.getUser("user", true);
	const reason = intr.options.getString("reason");
	const emojis = intr.client.maserEmojis;

	if (!intr.guild.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
		intr.editReply(`${emojis.cross} I don't have permissions to unban users`);

		return;
	}

	const ban = await intr.guild.bans.fetch(target.id).catch(() => null);

	if (!ban) {
		intr.editReply(`${emojis.cross} The user to target is not banned`);

		return;
	}

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, { suffix: auditLogSuffix })
		: `By ${intr.user.tag} ${intr.user.id}`;

	const info = `• **Reason**: ${reason ?? "No reason provided"}\n• **Target**: ${target.tag} (${target} ${
		target.id
	})`;

	const query = `${emojis.warning} Are you sure you want to unban **${target.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({ authorId: intr.user.id }) //
		.setInteraction(intr)
		.setQuery(query);

	collector
		.start({ noReply: true })
		.then(() => {
			intr.guild.members
				.unban(target.id, auditLogReason)
				.then(async () => {
					const instances = await new InstanceManager(intr.client, intr.guildId).initialise();

					const instance = await instances.createInstance({
						executorTag: intr.user.tag,
						executorId: intr.user.id,
						targetTag: target.tag,
						targetId: target.id,
						reason: reason ?? undefined,
						type: InstanceTypes.Unban
					});

					intr.logger.log(
						`Unbanned ${target.tag} (${target.id}) ${
							reason ? `with reason: "${reason}"` : "with no reason"
						}`
					);

					intr.editReply({
						content:
							`${emojis.check} Successfully **unbanned ${target.tag}** (${target.id})` +
							`in case **#${instance.id}**\n\n${info}`,
						components: []
					});
				})
				.catch(() => {
					intr.editReply({
						content: `${emojis.cross} Failed to unban ${target.tag} (${target.id})\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({ content: `${emojis.check} Gotcha. Command cancelled`, components: [] });
		});
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
