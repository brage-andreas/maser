import {
	ApplicationCommandOptionType,
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
	name: "ban",
	description: "Bans a user off this server",
	options: [
		USER(true),
		REASON("ban"),
		{
			name: "days",
			description: "How many days to prune user's messages. Default is 1 day.",
			type: ApplicationCommandOptionType.Integer,
			choices: [
				{ name: "1 day (default)", value: 1 },
				{ name: "No prune", value: 0 },
				{ name: "2 days", value: 2 },
				{ name: "3 days", value: 3 },
				{ name: "4 days", value: 4 },
				{ name: "5 days", value: 5 },
				{ name: "6 days", value: 6 },
				{ name: "7 days", value: 7 }
			]
		}
	]
};

function execute(intr: ChatInputCommandInteraction<"cached">) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");
	const days = intr.options.getInteger("days") ?? 1;
	const emojis = intr.client.maserEmojis;

	if (!target) {
		intr.editReply(`${emojis.cross} The user to target was not found in this server`);

		return;
	}

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
		intr.editReply(`${emojis.cross} The user to target is the owner of this server`);

		return;
	}

	if (!target.bannable) {
		intr.editReply(`${emojis.cross} I cannot ban the user to target`);

		return;
	}

	const auditLogSuffix = `| By ${intr.user.tag} ${intr.user.id}`;

	const auditLogReason = reason
		? Util.appendPrefixAndSuffix(reason, MAX_AUDIT_REASON_LEN, { suffix: auditLogSuffix })
		: `By ${intr.user.tag} ${intr.user.id}`;

	const info =
		`• **Reason**: ${reason ?? "No reason provided"}\n` +
		`• **Target**: ${target.user.tag} (${target} ${target.id})`;

	const query = `${emojis.warning} Are you sure you want to ban **${target.user.tag}** (${target.id})?\n\n${info}`;

	const collector = new ConfirmationButtons({ authorId: intr.user.id, inverted: true }) //
		.setInteraction(intr)
		.setQuery(query);

	collector
		.start({ noReply: true })
		.then(() => {
			target
				.ban({ reason: auditLogReason, days })
				.then(async () => {
					const instances = await new InstanceManager(intr.client, intr.guildId).initialise();

					const instance = await instances.createInstance({
						executorTag: intr.user.tag,
						executorId: intr.user.id,
						targetTag: target.user.tag,
						targetId: target.id,
						reason: reason ?? undefined,
						type: InstanceTypes.Ban
					});

					intr.logger.log(
						`Banned ${target.user.tag} (${target.id}) ${
							reason ? `with reason: "${reason}"` : "with no reason"
						}`
					);

					intr.editReply({
						content:
							`${emojis.check} Successfully **banned ${target.user.tag}** (${target.id})` +
							`in case **#${instance.id}**\n\n${info}`,
						components: []
					});
				})
				.catch(() => {
					intr.editReply({
						content: `${emojis.cross} Failed to ban ${target.user.tag} (${target.id})\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({ content: `${emojis.check} Gotcha. Command cancelled`, components: [] });
		});
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
