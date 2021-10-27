import type {
	CategoryChannel,
	ChatInputApplicationCommandData,
	Collection,
	GuildChannel,
	Role,
	VoiceChannel
} from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ConfirmationButtons } from "../../extensions/ButtonManager.js";
import ConfigManager from "../../database/src/config/ConfigManager.js";
import Util from "../../utils/index.js";
import ms from "ms";

const options = {
	wip: true
};

const roleNames = ["muted", "mute", "silenced"];

const FIFTEEN_MIN = 900000;
const FOURTY_FIVE_MIN = 2700000;
const ONE_AND_HALF_HRS = 129600000;
const THREE_HRS = 10800000;
const SIX_HRS = 21600000;
const TWELVE_HRS = 44200000;
const ONE_DAY = 86400000;
const THREE_DAYS = 259200000;

const NO_MUTE_ROLE = {
	USE: (role: Role) => {
		return `You have not set a mute role in your config. Do you want to set it to ${role}?`;
	},
	CREATE:
		"You have not set a mute role in your config. " +
		"Do you want to me to create one? (You can always edit it afterwards.)\n " +
		`Tip: If you name your muted role one of "${roleNames.join('", "')}", I will automatically detect them.`
};

const CREATED_MUTE_ROLE = {
	SUCCESS: (role: Role) => {
		return `Done! Created ${role} and set it to your config. You're good to go now.`;
	},
	FAIL: (role: Role) => {
		return `Created ${role} and set it to your config, but omething went wrong with setting your mute role.`;
	}
};

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

const OVERWRITES_PERMS_OBJ = {
	SEND_MESSAGES_IN_THREADS: false,
	USE_APPLICATION_COMMANDS: false,
	CREATE_PRIVATE_THREADS: false,
	CREATE_PUBLIC_THREADS: false,
	MENTION_EVERYONE: false,
	ADD_REACTIONS: false,
	SEND_MESSAGES: false,
	ATTACH_FILES: false,
	EMBED_LINKS: false,
	CONNECT: false,
	USE_VAD: false,
	SPEAK: false
};

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
// this needs :alot: of refactoring
async function execute(intr: CommandInteraction) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");
	const duration = intr.options.getInteger("duration") ?? THREE_HRS;
	const endTimestamp = Date.now() + duration;

	const [idEm, atEm, errEm, successEm] = intr.client.systemEmojis.findAndParse(
		"id_red",
		"at",
		"exclamation",
		"success"
	);

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

	if (target.permissions.has("MANAGE_ROLES")) {
		intr.editReply(`${errEm}The user to target cannot be muted`);
		return;
	}

	const config = new ConfigManager(intr.client, intr.guild.id, "muted_role_id");
	const existingMuteRole = intr.guild.roles.cache.find((role) => roleNames.includes(role.name.toLowerCase()));
	const mutedRole = await config.getRole();

	const existingMuteRoleValid = existingMuteRole?.comparePositionTo(intr.guild.me.roles.highest) ?? -1 >= 0;
	const muteRoleValid = mutedRole?.comparePositionTo(intr.guild.me.roles.highest) ?? -1 >= 0;

	if (!mutedRole) {
		if (existingMuteRole) {
			if (!existingMuteRoleValid) {
				intr.editReply({
					content:
						`I found the role ${existingMuteRole} but I cannot use it.` +
						"Give me a higher role, or move the role below mine.",
					allowedMentions: { parse: [] }
				});
				return;
			}

			const query = atEm + NO_MUTE_ROLE.USE(existingMuteRole);
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
							intr.editReply({ content: `${successEm}Done! You're good to go now.`, components: [] });
						})
						.catch(() => {
							intr.editReply({
								content: `${errEm}Something went wrong with setting your mute role. `,
								components: []
							});
						});
				})
				.catch(() => {
					intr.editReply({ content: "Gotcha. Command canceled", components: [] });
				});
		} else {
			const query = atEm + NO_MUTE_ROLE.CREATE;
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
							const success = successEm + CREATED_MUTE_ROLE.SUCCESS(newMutedRole);
							const fail = errEm + CREATED_MUTE_ROLE.FAIL(newMutedRole);
							// this isn't all needed perms, apparently
							const canOverwrite = intr.guild.me?.permissions.has("MANAGE_CHANNELS");

							if (canOverwrite) {
								const channels = intr.guild.channels.cache.filter((ch) =>
									["GUILD_TEXT", "GUILD_VOICE", "GUILD_CATEGORY"].includes(ch.type)
								) as Collection<string, GuildChannel | VoiceChannel | CategoryChannel>;

								const reason = `Automatic mute role created by ${intr.user.tag} (${intr.user.id})`;
								channels.forEach((channel) => {
									channel.permissionOverwrites.edit(newMutedRole, OVERWRITES_PERMS_OBJ, {
										type: 0,
										reason
									});
								});
							}

							config
								.set(newMutedRole.id)
								.then(() => {
									intr.editReply({
										allowedMentions: { parse: [] },
										content:
											success +
											(!canOverwrite
												? "\n **Note:** I don't have permissions edit channel overwrites for you."
												: ""),
										components: []
									});
								})
								.catch(() => {
									intr.editReply({
										allowedMentions: { parse: [] },
										components: [],
										content:
											fail +
											(!canOverwrite
												? "\n **Note:** I don't have permissions edit channel overwrites for you."
												: "")
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
		if (!muteRoleValid) {
			intr.editReply({
				content:
					`I found the role from your config (${mutedRole}) but I cannot use it. ` +
					"Give me a higher role, or move the role below mine.",
				allowedMentions: { parse: [] }
			});
		}

		const reasonStr = reason ?? "No reason provided";
		const expiration = Date.now() + duration;

		const query =
			`${atEm}Are you sure you want to mute ${target} ` +
			(reason ? `${reasonStr} ` : "") +
			`for ${ms(duration, { long: true })} (${Util.date(expiration)})?`;
		const collector = new ConfirmationButtons({ author: intr.user })
			.setInteraction(intr)
			.setUser(intr.user)
			.setQuery(query);

		collector
			.start({ noReply: true })
			.then(() => {
				intr.editReply({ content: "omg muted", components: [] });
			})
			.catch(() => {
				intr.editReply({ content: "ok", components: [] });
			});
	}

	intr.logger.log(`Muted`);
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
