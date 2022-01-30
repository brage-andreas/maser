import { type ChatInputApplicationCommandData, type CommandInteraction } from "discord.js";
import { InstanceTypes } from "../../constants/database.js";
import { MAX_AUDIT_REASON_LEN } from "../../constants/index.js";
import InstanceManager from "../../database/InstanceManager.js";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import Util from "../../utils/index.js";
import { REASON, USER } from "./noread.methods.js";

const options: Partial<CommandOptions> = {
	wip: true
};

const data: ChatInputApplicationCommandData = {
	name: "untimeout",
	description: "Removes the time-out of a user",
	options: [
		USER(true), //
		REASON("time-out")
	]
};

function execute(intr: CommandInteraction<"cached">) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");
	const expiration = target?.communicationDisabledUntilTimestamp;
	const emojis = intr.client.maserEmojis;

	if (!intr.guild.me?.permissions.has("MODERATE_MEMBERS")) {
		intr.editReply(`${emojis.cross} I do not have the "Time out members" permission`);

		return;
	}

	if (!target) {
		intr.editReply(`${emojis.cross} The user to target was not found in this server`);

		return;
	}

	if (!expiration) {
		intr.editReply(`${emojis.cross} The user to target is not in a timeout`);

		return;
	}

	if (target.id === intr.guild.ownerId) {
		intr.editReply(`${emojis.cross} The user to target is the owner of this server`);

		return;
	}

	const info =
		`• **Reason**: ${reason ?? "No reason provided"}\n` +
		`• **Expiration**: ${Util.date(expiration)}\n` +
		`• **Target**: ${target.user.tag} (${target} ${target.id})`;

	const query = `${emojis.warning} Are you sure you want to untimeout **${target.user.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({ authorId: intr.user.id }) //
		.setInteraction(intr)
		.setQuery(query);

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, { suffix: auditLogSuffix })
		: `By ${intr.user.tag} ${intr.user.id}`;

	collector
		.start({ noReply: true })
		.then(() => {
			target
				.disableCommunicationUntil(null, auditLogReason)
				.then(async () => {
					const instances = await new InstanceManager(intr.client, intr.guildId).initialise();

					const instance = await instances.createInstance(
						{
							executorTag: intr.user.tag,
							executorId: intr.user.id,
							targetTag: target.user.tag,
							targetId: target.id,
							reason: reason ?? undefined,
							type: InstanceTypes.Untimeout
						},
						true
					);

					intr.editReply({
						content:
							`${emojis.check} Successfully **removed timeout** on **${target.user.tag}** (${target.id}) ` +
							`in instance **#${instance.id}**\n\n${info}`,
						components: []
					});

					intr.logger.log(`Removed time-out of ${target.user.tag} (${target.id}) with reason: ${reason}`);
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
			intr.editReply({ content: `${emojis.check} Gotcha. Command cancelled`, components: [] });
		});
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
