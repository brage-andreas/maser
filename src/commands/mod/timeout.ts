import { type ChatInputApplicationCommandData, type CommandInteraction } from "discord.js";
import ms from "ms";
import { InstanceTypes } from "../../constants/database.js";
import { DURATIONS, MAX_AUDIT_REASON_LEN } from "../../constants/index.js";
import InstanceManager from "../../database/InstanceManager.js";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import Util from "../../utils/index.js";
import { DURATION, REASON, USER } from "./noread.methods.js";

const options: Partial<CommandOptions> = {
	wip: true
};

const data: ChatInputApplicationCommandData = {
	name: "timeout",
	description: "Time out a user for a given time",
	options: [
		USER(true), //
		REASON("time-out"),
		DURATION("time-out")
	]
};

function execute(intr: CommandInteraction<"cached">) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");
	const duration = intr.options.getInteger("duration") ?? DURATIONS.THREE_HRS;
	const expiration = Date.now() + duration;
	const emojis = intr.client.maserEmojis;

	if (!intr.guild.me?.permissions.has("MODERATE_MEMBERS")) {
		intr.editReply(`${emojis.cross} I do not have the "Time out members" permission`);

		return;
	}

	if (!target) {
		intr.editReply(`${emojis.cross} The user to target was not found in this server`);

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

	if (Date.now() < (target.communicationDisabledUntilTimestamp ?? 0)) {
		intr.editReply(`${emojis.cross} The user to target is already in a time-out`);

		return;
	}

	const info =
		`• **Reason**: ${reason ?? "No reason provided"}\n` +
		`• **Duration**: ${ms(duration, { long: true })} (Expiration ${Util.date(expiration)})\n` +
		`• **Target**: ${target.user.tag} (${target} ${target.id})`;

	const query = `${emojis.warning} Are you sure you want to timeout **${target.user.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({ authorId: intr.user.id, inverted: true }) //
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
				.disableCommunicationUntil(Date.now() + duration, auditLogReason)
				.then(async () => {
					const instances = await new InstanceManager(intr.client, intr.guildId).initialise();

					const instance = await instances.createInstance(
						{
							executorTag: intr.user.tag,
							executorId: intr.user.id,
							targetTag: target.user.tag,
							targetId: target.id,
							duration,
							reason: reason ?? undefined,
							type: InstanceTypes.Timeout
						},
						true
					);

					intr.editReply({
						content:
							`${emojis.check} Successfully **timed out ${target.user.tag}** (${target.id}) ` +
							`in instance **#${instance.id}**\n\n${info}`,
						components: []
					});

					intr.logger.log(
						`Timed out ${target.user.tag} (${target.id}) ` +
							`for ${ms(duration, { long: true })} with reason: ${reason}`
					);
				})
				.catch(() => {
					intr.editReply({
						content: `${emojis.cross} I failed to time out ${target.user.tag} (${target.id})\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({ content: `${emojis.check} Gotcha. Command cancelled`, components: [] });
		});
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
