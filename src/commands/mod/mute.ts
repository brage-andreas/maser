import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import ConfigManager from "../../database/src/config/ConfigManager.js";
import { ConfirmationButtons } from "../../extensions/ButtonManager.js";

const options = {
	wip: true
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
			type: ApplicationCommandOptionTypes.STRING,
			description: "The duration for this mute",
			choices: [
				{ name: "3 hours (default)", value: "3h" },
				{ name: "15 minutes", value: "15m" },
				{ name: "45 minutes", value: "45m" },
				{ name: "1,5 hours", value: "1.5h" },
				{ name: "6 hours", value: "6h" },
				{ name: "12 hours", value: "12h" },
				{ name: "1 day", value: "1d" },
				{ name: "3 days", value: "3d" }
			]
		}
	]
};

async function execute(intr: CommandInteraction) {
	const target = intr.options.getMember("user", true);
	const reason = intr.options.getString("reason") ?? "No reason provided";
	const duration = intr.options.getString("duration") ?? "3h";

	const [idEm, atEm, errEm] = intr.client.systemEmojis.findAndParse("id_red", "at", "exclamation");

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
							intr.editReply({ content: "Done! You're good to go now.", components: [] });
						})
						.catch(() => {
							intr.editReply({
								content: "Something went wrong with setting your mute role.",
								components: []
							});
						});
				})
				.catch(() => {
					intr.editReply("Gotcha. Command canceled");
				});
		}
	}

	intr.logger.log(`Muted`);
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
