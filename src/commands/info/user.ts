/* eslint-disable padding-line-between-statements */

import { type APIEmbed } from "discord-api-types/v9";
import {
	ApplicationCommandOptionType,
	type ChatInputApplicationCommandData,
	type CommandInteraction
} from "discord.js";
import { EMOJIS } from "../../constants/emojis.js";
import { defaultEmbed, USER_FLAGS_STRINGS } from "../../constants/index.js";
import { type Command } from "../../typings/index.js";
import Util from "../../utils/index.js";

const data: ChatInputApplicationCommandData = {
	name: "user",
	description: "Sends information about a user",
	options: [
		{
			name: "user",
			description: "The user to target",
			type: ApplicationCommandOptionType.User
		}
	]
};

async function execute(intr: CommandInteraction<"cached">) {
	const userOptionIsProvided = Boolean(intr.options.get("user")?.value);
	const member = userOptionIsProvided ? intr.options.getMember("user") : intr.member;
	const user = userOptionIsProvided ? intr.options.getUser("user", true) : intr.user;

	const getColor = (hex: number | undefined) => {
		const { green } = intr.client.colors;

		if (!hex) return green;
		const empty = hex === 0x000000 || hex === 0xffffff;

		return empty ? green : hex;
	};

	const premium = Boolean(member?.premiumSinceTimestamp);
	const owner = Boolean(member) && member!.id === member?.guild.ownerId;

	const rawFlags = (await user.fetchFlags()).toArray();
	const flags = rawFlags.map((flag) => USER_FLAGS_STRINGS[flag] ?? flag);

	if (premium) flags.push(`${EMOJIS.boost} Booster`);

	const memberAvatar = member?.displayAvatarURL({ size: 2048 }) ?? null;
	const userAvatar = user.displayAvatarURL({ size: 2048 });
	const displayAvatar = memberAvatar ?? userAvatar;
	const banner = user.bannerURL({ size: 2048 });

	const joined = member?.joinedTimestamp ? Util.date(member.joinedTimestamp) : null;

	const color = getColor(member?.displayColor);

	const created = Util.date(user.createdTimestamp);

	const hoistedRole = member?.roles.hoist?.toString() ?? null;
	const coloredRole = member?.roles.color?.toString() ?? null;
	const iconRole = member?.roles.icon?.iconURL({ size: 1024 }) ?? null;

	let roles = `${Util.parseRoles(member)}\n`;

	if (hoistedRole) roles += `\n• Hoisted: ${hoistedRole}`;
	if (coloredRole) roles += `\n• Coloured: ${coloredRole}`;
	if (iconRole) roles += `\n• Icon: ${iconRole}`;

	const { bot, tag, id } = user;

	const name = Util.escapeDiscordMarkdown(member?.displayName ?? tag);

	let infoFieldValue =
		// eslint-disable-next-line prefer-template
		(owner ? "• 👑 Server Owner\n" : "") +
		`• Tag: \`${tag}\`\n` +
		`• ID: \`${id}\`\n` +
		`• Created: ${created}\n` +
		(member ? `• Joined: ${joined}\n• Colour: \`#${color.toString(16)}\`\n` : "") +
		`• [Avatar](${displayAvatar})`;

	if (premium) infoFieldValue += "\n• Booster";

	if (bot) infoFieldValue += "\n• Bot";

	const userEmbed: APIEmbed = {
		...defaultEmbed(intr),
		color,
		title: name,
		thumbnail: { url: displayAvatar },
		fields: [
			{ name: "Info", value: infoFieldValue },
			{ name: "Badges", value: flags.length ? `• ${flags.join("\n• ")}` : "None" }
		]
	};

	if (member)
		userEmbed.fields!.push({
			name: `Roles (${member.roles.cache.size - 1})`,
			value: 1 < member.roles.cache.size ? roles : "No roles"
		});

	if (owner) userEmbed.description = "👑 Server owner";

	intr.editReply({ embeds: [userEmbed] });

	intr.logger.log(`Sent info of ${user.tag} (${user.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
