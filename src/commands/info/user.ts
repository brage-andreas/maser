import type { ApplicationCommandData, GuildMember } from "discord.js";
import type { CmdIntr } from "../../typings.js";

import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { MessageEmbed } from "discord.js";
import { USER_FLAGS } from "../../constants.js";
import Util from "../../utils/index.js";

export const data: ApplicationCommandData = {
	name: "user",
	description: "Sends information about a user",
	options: [
		{
			name: "user",
			description: "The user to target",
			type: ApplicationCommandOptionType.User as number
		}
	]
};

export async function execute(intr: CmdIntr) {
	const userOptionIsProvided = !!intr.options.getUser("user");
	const user = userOptionIsProvided ? intr.options.getUser("user", true) : intr.user;
	const member = userOptionIsProvided ? (intr.options.getMember("user") as GuildMember | null) : intr.member;

	const getDate = (timestamp: number | null) => {
		return timestamp ? `${Util.Date(timestamp)}` : null;
	};

	const getRoles = (member: GuildMember | null) => {
		if (!member) return null;

		const roles = member.roles.cache;
		if (roles.size === 1) return null;

		const sortedRoles = roles.sort((a, b) => b.position - a.position);
		const parsedRoles = sortedRoles.map((role) => role.toString()).slice(0, -1); // revomes @everyone

		const fourRoles = parsedRoles.slice(0, 4).join(", ");
		const excess = parsedRoles.length - 4;
		const excessStr = excess > 0 ? `, and ${excess} more` : "";

		return fourRoles + excessStr;
	};

	const parseFlags = (flagArray: string[]) => {
		const flags = flagArray.join(", ");
		return flags.charAt(0).toUpperCase() + flags.slice(1);
	};

	const getColor = (hex: `#${string}` | undefined) => {
		const invis = intr.client.colors.try("INVIS");
		if (!hex) return invis;
		const empty = hex === "#000000" || hex.toLowerCase() === "#ffffff";
		return empty ? invis : hex;
	};

	const avatar = user.displayAvatarURL({ size: 2048, dynamic: true });
	const rawFlags = (await user.fetchFlags()).toArray();
	const flags = rawFlags.map((flag) => USER_FLAGS[flag] ?? flag);
	const created = getDate(user.createdTimestamp);
	const tag = user.tag;
	const bot = user.bot;
	const id = user.id;

	const color = getColor(member?.displayHexColor);
	const joined = member ? getDate(member.joinedTimestamp) : null;
	const owner = !!member && member.id === member?.guild.ownerId;
	const premium = !!member?.premiumSince;
	const name = member?.displayName ?? user.tag;
	const roles = getRoles(member);

	const userEmbed = new MessageEmbed()
		.setAuthor(`${intr.user.tag} (${intr.user.id})`, intr.user.displayAvatarURL())
		.setTimestamp()
		.setColor(color)
		.setThumbnail(avatar)
		.setTitle(name);

	if (member) userEmbed.addField("Tag", tag);
	userEmbed.addField("Id", id);

	if (member) {
		userEmbed.addField("Roles", roles ?? "No roles").addField("Bot", bot ? "Yes" : "No", true);
		userEmbed.addField("Boosting", premium ? "Yes" : "No", true);
		userEmbed.addField("Avatar", `[Link](${avatar})`).addField("Color", member.displayHexColor);
	}

	userEmbed.addField("Badges", flags.length ? parseFlags(flags) : "No badges");
	if (created) userEmbed.addField("Created", created, true);
	if (joined) userEmbed.addField("Joined", joined, true);
	if (owner) userEmbed.setDescription("👑 Server owner");

	intr.editReply({ embeds: [userEmbed] });

	intr.logger.log(`Sent info of ${user.tag} (${user.id})`);
}
