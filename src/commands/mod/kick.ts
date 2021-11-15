import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";
import { REASON, USER } from "./.methods.js";
import InstanceManager from "../../database/src/instance/InstanceManager.js";
import { INSTANCE_TYPES } from "../../constants.js";
import { ConfirmationButtons } from "../../extensions/ButtonManager.js";

const data: ChatInputApplicationCommandData = {
	name: "kick",
	description: "Kicks a user off this server",
	options: [USER(true), REASON("kick")]
};

async function execute(intr: CommandInteraction) {
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

	let reasonStr = `${reason ? `${reason} | ` : ""}By ${intr.user.tag} (${intr.user.id})`;
	if (reasonStr.length > 512) {
		const base = ` | By ${intr.user.tag} (${intr.user.id})`;
		reasonStr = `${reason!.slice(512 - base.length - 3)}...${base}`;
	}

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
				.kick(reasonStr)
				.then(async () => {
					const instances = await new InstanceManager(intr.client, intr.guildId).initialise();
					const instance = await instances.createInstance({
						executorTag: intr.user.tag,
						executorId: intr.user.id,
						targetTag: target.user.tag,
						targetId: target.id,
						reason: reason ?? undefined,
						type: INSTANCE_TYPES.Kick
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

export const getCommand = () => ({ data, execute } as Partial<Command>);
