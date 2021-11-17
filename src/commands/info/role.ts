import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { MessageEmbed, Role } from "discord.js";
import Util from "../../utils/index.js";

const data: ChatInputApplicationCommandData = {
	name: "role",
	description: "Sends information about a role",
	options: [
		{
			name: "role",
			description: "The role to target",
			type: ApplicationCommandOptionTypes.ROLE,
			required: true
		}
	]
};

async function execute(intr: CommandInteraction) {
	const applyS = (string: string, size: number) => (size !== 1 ? string + "s" : string);
	const { guild } = intr;

	const { emBug, emURL } = intr.client.systemEmojis;

	const role = intr.options.getRole("role", true);
	if (!(role instanceof Role)) {
		intr.editReply(`${emBug} Something went wrong with getting the role`);
		return;
	}

	const getColor = (hex: `#${string}` | undefined) => {
		const { green, black, white } = intr.client.colors;

		if (!hex) return green;
		hex = hex.toUpperCase() as `#${string}`;

		return hex === black || hex === white ? green : hex;
	};

	await guild.members.fetch();

	const icon = role.iconURL() ? `[${emURL} Link](${role.iconURL()})` : role.unicodeEmoji ?? "None";
	const { integrationId, botId, premiumSubscriberRole: boostRole } = role.tags ?? {};

	const isEveryone = role.id === guild.id;
	const { bitfield } = isEveryone ? role.permissions : role.permissions.remove(guild.roles.everyone.permissions);

	const tooBig = guild.memberCount > 1000;
	const memberCount = tooBig
		? "I cannot get an accurate number"
		: `${role.members.size} ${applyS("member", role.members.size)}`;

	const roleEmbed = new MessageEmbed()
		.setAuthor(`${intr.user.tag} (${intr.user.id})`, intr.user.displayAvatarURL())
		.setColor(getColor(role.hexColor))
		.setTitle(role.name)
		.setTimestamp()
		.addField("Created", Util.date(role.createdTimestamp))
		.addField("Members", memberCount)
		.addField("Hoisted", role.hoist ? "Yes" : "No")
		.addField("Icon", icon)
		.addField(
			"Tags",
			`Bot role: ${botId ? "Yes" : "No"}\n` +
				`Integration role: ${integrationId ? "Yes" : "No"}\n` +
				`Booster role: ${boostRole ? "Yes" : "No"}`
		)
		.addField(
			isEveryone ? "Permissions" : "Extra permissions",
			`[${bitfield}](<https://finitereality.github.io/permissions-calculator/?v=${bitfield}>)`
		);

	intr.editReply({ embeds: [roleEmbed] });

	intr.logger.log(`Sent info of ${role.name} (${role.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
