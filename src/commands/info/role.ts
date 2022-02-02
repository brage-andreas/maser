import {
	ApplicationCommandOptionType,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
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
			type: ApplicationCommandOptionType.Role,
			required: true
		}
	]
};

async function execute(intr: ChatInputCommandInteraction<"cached">) {
	const applyS = (string: string, size: number) => (size !== 1 ? `${string}s` : string);
	const { guild } = intr;
	const role = intr.options.getRole("role", true);

	const getColor = (hex: number | undefined) => {
		const { green, black, white } = intr.client.colors;

		if (!hex) return green;

		return hex === black || hex === white ? green : hex;
	};

	await guild.members.fetch();

	const icon = role.iconURL() ? `[Link to icon](${role.iconURL()})` : role.unicodeEmoji ?? "None";
	const { integrationId, botId, premiumSubscriberRole: boostRole } = role.tags ?? {};
	const isEveryone = role.id === guild.id;
	const { bitfield } = isEveryone ? role.permissions : role.permissions.remove(guild.roles.everyone.permissions);
	// You can only fetch 1000 members at a time.
	const tooBig = guild.memberCount > 1000;

	const memberCount = tooBig
		? `${role.members.size} ${applyS("member", role.members.size)} (might not be accurate)`
		: `${role.members.size} ${applyS("member", role.members.size)}`;

	const roleEmbed = newDefaultEmbed(intr)
		.setColor(getColor(role.color))
		.setTitle(role.name)
		.addFields(
			{ name: "Created", value: Util.date(role.createdTimestamp) },
			{ name: "Members", value: memberCount },
			{ name: "Hoisted", value: role.hoist ? "Yes" : "No" },
			{ name: "Icon", value: icon },
			{
				name: "Tags",
				value:
					`Bot role: ${botId ? "Yes" : "No"}\n` +
					`Integration role: ${integrationId ? "Yes" : "No"}\n` +
					`Booster role: ${boostRole ? "Yes" : "No"}`
			},
			{
				name: isEveryone ? "Permissions" : "Extra permissions",
				value: `[${bitfield}](<https://finitereality.github.io/permissions-calculator/?v=${bitfield}>)`
			}
		);

	intr.editReply({ embeds: [roleEmbed] });

	intr.logger.log(`Sent info of ${role.name} (${role.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
