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
	name: "time-out",
	description: "Time out a user for a given time",
	options: [
		USER(true), //
		REASON("time-out"),
		DURATION("time-out")
	]
};

async function execute(intr: CommandInteraction<"cached">) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");
	const duration = intr.options.getInteger("duration") ?? DURATIONS.THREE_HRS;
	const expiration = Date.now() + duration;

	const { emError, emUserLock, emSuccess, emCrown, emXMark, emCheckMark } = intr.client.systemEmojis;

	if (!intr.guild.me?.permissions.has("MODERATE_MEMBERS")) {
		intr.editReply(`${emUserLock} I do not have the "Time out members" permission`);
		return;
	}

	if (!target) {
		intr.editReply(`${emXMark} The user to target was not found in this server`);
		return;
	}

	if (target.id === intr.user.id) {
		intr.editReply(`${emError} You cannot do this action on yourself`);
		return;
	}

	if (target.id === intr.client.user.id) {
		intr.editReply(`${emError} I cannot do this action on myself`);
		return;
	}

	if (target.id === intr.guild.ownerId) {
		intr.editReply(`${emCrown} The user to target is the owner of this server`);
		return;
	}

	const info =
		`• **Reason**: ${reason ?? "No reason provided"}\n` +
		`• **Duration**: ${ms(duration, { long: true })} (Expiration ${Util.date(expiration)})\n` +
		`• **Target**: ${target.user.tag} (${target} ${target.id})`;

	const query = `Are you sure you want to **time out ${target.user.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({ author: intr.user })
		.setInteraction(intr)
		.setUser(intr.user)
		.setQuery(query);

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;
	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, { suffix: auditLogSuffix })
		: `Time-out by ${intr.user.tag} ${intr.user.id}`;

	collector
		.start({ noReply: true })
		.then(() => {
			target
				.timeout(duration, auditLogReason)
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
							type: InstanceTypes.Mute
						},
						true
					);

					intr.editReply({
						content:
							`${emSuccess} Successfully **timed out ${target.user.tag}** (${target.id}) ` +
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
						content: `${emError} I failed to time out ${target.user.tag} (${target.id})\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({ content: `${emCheckMark} Gotcha. Command cancelled`, components: [] });
		});
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
