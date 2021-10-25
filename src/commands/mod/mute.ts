import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import ConfigManager from "../../database/src/config/ConfigManager.js";
import { ConfirmationButtons } from "../../extensions/ButtonManager.js";

const options = {
	wip: true
};

const FIFTEEN_MIN = 900000;
const FOURTY_FIVE_MIN = 2700000;
const ONE_AND_HALF_HRS = 129600000;
const THREE_HRS = 10800000;
const SIX_HRS = 21600000;
const TWELVE_HRS = 44200000;
const ONE_DAY = 86400000;
const THREE_DAYS = 259200000;

const getDefaultMuteRoleData = (intr: CommandInteraction) => ({
	reason: `Automatic mute role created by ${intr.user.tag} (${intr.user.id})`,
	mentionable: false,
	name: "Muted",
	hoist: false,
	position: 1,
	permissions: intr.guild.roles.everyone.permissions.remove(
		"SEND_MESSAGES_IN_THREADS",
		"USE_APPLICATION_COMMANDS",
		"CREATE_PRIVATE_THREADS",
		"CREATE_PUBLIC_THREADS",
		"MENTION_EVERYONE",
		"ADD_REACTIONS",
		"SEND_MESSAGES",
		"ATTACH_FILES",
		"EMBED_LINKS",
		"CONNECT",
		"USE_VAD",
		"SPEAK"
	)
});

const data: ChatInputApplicationCommandData = {
	name: "mute",
	description: "Mutes a user for a given time",
	options: [
		{
			name: "user",
			type: ApplicationCommandOptionTypes.USER,
			description: "The user to mute",
			required: true
		},
		{
			name: "reason",
			type: ApplicationCommandOptionTypes.STRING,
			description: "The reason for this mute"
		},
		{
			name: "duration",
			type: ApplicationCommandOptionTypes.INTEGER,
			description: "The duration for this mute",
			choices: [
				{ name: "3 hours (default)", value: THREE_HRS },
				{ name: "15 minutes", value: FIFTEEN_MIN },
				{ name: "45 minutes", value: FOURTY_FIVE_MIN },
				{ name: "1,5 hours", value: ONE_AND_HALF_HRS },
				{ name: "6 hours", value: SIX_HRS },
				{ name: "12 hours", value: TWELVE_HRS },
				{ name: "1 day", value: ONE_DAY },
				{ name: "3 days", value: THREE_DAYS }
			]
		}
	]
};

// TODO: refactor
async function execute(intr: CommandInteraction) {
	const target = intr.options.getMember("user", true);
	const reason = intr.options.getString("reason") ?? "No reason provided";
	const duration = intr.options.getInteger("duration") ?? THREE_HRS;
	const endTimestamp = Date.now() + duration;

	const [idEm, atEm, errEm, sucEm] = intr.client.systemEmojis.findAndParse("id_red", "at", "exclamation", "success");

	if (!intr.guild.me?.permissions.has("MANAGE_ROLES")) {
		intr.editReply(`${errEm}I don't have permissions to add or remove roles`);
		return;
	}

	if (!target) {
		intr.editReply(`${idEm}The user to target was not found in this server`);
		return;
	}

	if (target.id === intr.user.id) {
		intr.editReply(`${errEm}You cannot do this action on yourself`);
		return;
	}

	if (target.id === intr.client.user.id) {
		intr.editReply(`${errEm}I cannot do this action on myself`);
		return;
	}

	if (target.id === intr.guild.ownerId) {
		intr.editReply(`${errEm}The user to target is the owner of this server`);
		return;
	}

	if (target.manageable) {
		intr.editReply(`${errEm}I cannot perform any action on this user. Are they above me in the role hierarchy?`);
		return;
	}

	const config = new ConfigManager(intr.client, intr.guild.id, "muted_role_id");
	const mutedRole = await config.getRole();

	if (!mutedRole) {
		const existingMuteRole = intr.guild.roles.cache.find((role) =>
			["muted", "mute", "silenced"].includes(role.name.toLowerCase())
		);

		if (existingMuteRole) {
			const query = `${atEm}You have not set a mute role in your config. Do you want to set it to ${existingMuteRole}?`;
			const collector = new ConfirmationButtons({ author: intr.user })
				.setInteraction(intr)
				.setUser(intr.user)
				.setQuery(query);

			collector
				.start({ noReply: true })
				.then(() => {
					config
						.set(existingMuteRole.id)
						.then(() => {
							intr.editReply({ content: `${sucEm}Done! You're good to go now.`, components: [] });
						})
						.catch(() => {
							intr.editReply({
								content: `${errEm}Something went wrong with setting your mute role.`,
								components: []
							});
						});
				})
				.catch(() => {
					intr.editReply("Gotcha. Command canceled");
				});
		} else {
			const query = `${atEm}You have not set a mute role in your config. Do you want to me to create one?\nYou can edit it afterwards.`;
			const collector = new ConfirmationButtons({ author: intr.user })
				.setInteraction(intr)
				.setUser(intr.user)
				.setQuery(query);

			collector
				.start({ noReply: true })
				.then(async () => {
					intr.guild.roles
						.create(getDefaultMuteRoleData(intr))
						.then((newMutedRole) => {
							const success = `${sucEm}Done! Created ${newMutedRole} and set it to your config. You're good to go now.`;
							const fail = `${errEm}Created ${newMutedRole} and set it to your config, but omething went wrong with setting your mute role.`;
							config
								.set(newMutedRole.id)
								.then(() => {
									intr.editReply({
										content: success,
										allowedMentions: { parse: [] },
										components: []
									});
								})
								.catch(() => {
									intr.editReply({
										content: fail,
										components: []
									});
								});
						})
						.catch((reason) => {
							intr.editReply({
								content: `${errEm}Creating the role failed with reason: ${reason}`,
								components: []
							});
						});
				})
				.catch(() => {
					intr.editReply("Gotcha. Command canceled");
				});
		}
	} else {
		intr.editReply("omg muted");
	}

	intr.logger.log(`Muted`);
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
