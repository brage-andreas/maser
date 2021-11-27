import type { CommandInteraction } from "../typings.js";
import { COLORS } from "../constants";
import Discord from "discord.js";

export default class MessageEmbed extends Discord.MessageEmbed {
	constructor(interaction?: CommandInteraction) {
		if (!interaction) {
			super();
			return;
		}

		const embedObj = {
			author: {
				iconURL: interaction.member.displayAvatarURL(),
				name: `${interaction.user.tag} (${interaction.user.id})`
			},
			color: COLORS.green
		};

		super(embedObj);
	}
}
