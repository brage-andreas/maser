import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";
import { REASON, USER } from "./.methods.js";
import InstanceManager from "../../database/src/instance/InstanceManager.js";
import { INSTANCE_TYPES } from "../../constants.js";

const data: ChatInputApplicationCommandData = {
	name: "kick",
	description: "Kicks a user off this server",
	options: [USER(true), REASON("kick")]
};

async function execute(intr: CommandInteraction) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");

	const { emXMark, emUserLock, emError, emCrown } = intr.client.systemEmojis;

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

	const instances = await new InstanceManager(intr.client, intr.guildId).initialise();
	await instances.createInstance({
		executorTag: intr.user.tag,
		executorId: intr.user.id,
		targetTag: target.user.tag,
		targetId: target.id,
		reason: reason ?? "null",
		type: INSTANCE_TYPES.Kick
	});

	intr.logger.log(
		`Kicked ${target.user.tag} (${target.id}) ${reason ? `with reason: "${reason}"` : "with no provided reason"}`
	);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
