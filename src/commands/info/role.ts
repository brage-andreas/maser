import { type ChatInputApplicationCommandData, type CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { newDefaultEmbed } from "../../constants/index.js";
import { type Command } from "../../typings/index.js";
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

async function execute(intr: CommandInteraction<"cached">) {
	const applyS = (string: string, size: number) => (size !== 1 ? `${string}s` : string);
	const { guild } = intr;
	const emojis = intr.client.maserEmojis;
	const role = intr.options.getRole("role", true);

	const getColor = (hex: `#${string}` | undefined) => {
		const { green, black, white } = intr.client.colors;

		if (!hex) return green;

		const parsedHex = hex.toUpperCase() as `#${string}`;

		return parsedHex === black || parsedHex === white ? green : hex;
	};

	await guild.members.fetch();

	const icon = role.iconURL() ? `${emojis.url} [Link](${role.iconURL()})` : role.unicodeEmoji ?? "None";
	const { integrationId, botId, premiumSubscriberRole: boostRole } = role.tags ?? {};
	const isEveryone = role.id === guild.id;
	const { bitfield } = isEveryone ? role.permissions : role.permissions.remove(guild.roles.everyone.permissions);
	const tooBig = guild.memberCount > 1000;

	const memberCount = tooBig
		? "I cannot get an accurate number"
		: `${role.members.size} ${applyS("member", role.members.size)}`;

	const roleEmbed = newDefaultEmbed(intr)
		.setColor(getColor(role.hexColor))
		.setTitle(role.name)
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
