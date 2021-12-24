import { type ChatInputApplicationCommandData, type CommandInteraction } from "discord.js";
import { InstanceTypes, MAX_AUDIT_REASON_LEN } from "../../constants.js";
import InstanceManager from "../../database/InstanceManager.js";
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

async function execute(intr: CommandInteraction<"cached">) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");

	const { emXMark, emUserLock, emError, emCrown, emSuccess, emCheckMark } = intr.client.systemEmojis;

	if (!target) {
		intr.editReply(`${emXMark} The user to target was not found in this server`);
		return;
	}

	if (!intr.guild.me?.permissions.has("KICK_MEMBERS")) {
		intr.editReply(`${emUserLock} I don't have permissions to kick users`);
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

	if (target.permissions.has("KICK_MEMBERS")) {
		intr.editReply(`${emXMark} The user to target cannot be kicked`);
		return;
	}

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;
	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, { suffix: auditLogSuffix })
		: `Kick by ${intr.user.tag} ${intr.user.id}`;

	const info =
		`• **Reason**: ${reason ?? "No reason provided"}\n` +
		`• **Target**: ${target.user.tag} (${target} ${target.id})`;

	const query = `Are you sure you want to **kick ${target.user.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({ author: intr.user })
		.setInteraction(intr)
		.setUser(intr.user)
		.setQuery(query);

	collector
		.start({ noReply: true })
		.then(() => {
			target
				.kick(auditLogReason)
				.then(async () => {
					const instances = await new InstanceManager(intr.client, intr.guildId).initialise();
					const instance = await instances.createInstance({
						executorTag: intr.user.tag,
						executorId: intr.user.id,
						targetTag: target.user.tag,
						targetId: target.id,
						reason: reason ?? undefined,
						type: InstanceTypes.Kick
					});

					intr.logger.log(
						`Kicked ${target.user.tag} (${target.id}) ${
							reason ? `with reason: "${reason}"` : "with no reason"
						}`
					);

					intr.editReply({
						content:
							`${emSuccess} Successfully **kicked ${target.user.tag}** (${target.id})` +
							`in case **#${instance.id}**\n\n${info}`,
						components: []
					});
				})
				.catch(() => {
					intr.editReply({
						content: `${emError} Failed to kick ${target.user.tag} (${target.id})\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({ content: `${emCheckMark} Gotcha. Command cancelled`, components: [] });
		});
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
