import type { ApplicationCommandData, GuildMember } from "discord.js";
import type { CmdIntr } from "../../Typings.js";

import { ApplicationCommandOptionType } from "discord-api-types";
import { MessageEmbed } from "discord.js";
import { USER_FLAGS } from "../../Constants.js";
import Util from "../../utils/index.js";

export const data: ApplicationCommandData = {
	name: "user",
	description: "Sends information about a user",
	options: [
		{
			name: "user",
			description: "The user to target",
			type: ApplicationCommandOptionType.User as number
		},
		{
			name: "hide",
			description: "To hide the output or not",
			type: ApplicationCommandOptionType.Boolean as number
		}
	]
};

export async function execute(intr: CmdIntr) {
	const user = intr.options.getUser("user") ?? intr.user;
	const member = (intr.options.getMember("user") ?? intr.member) as GuildMember;
	const hide = intr.options.getBoolean("hide") ?? false;

	await intr.deferReply({ ephemeral: hide });

	const getDate = (timestamp: number | null) => {
		return timestamp ? `${Util.Date(timestamp)}` : null;
	};

	const getRoles = (member: GuildMember) => {
		const sortedRoles = member.roles.cache.sort((a, b) => b.position - a.position);
		const parsedRoles = sortedRoles.map((role) => role.toString()).slice(0, -1);

		const fourRoles = parsedRoles.slice(0, 4).join(", ");
		const excess = parsedRoles.length - 4;
		const excessStr = excess > 0 ? `, ${excess} more...` : "";

		return fourRoles + excessStr;
	};

	const parseFlags = (flagArray: string[]) => {
		const flags = flagArray.join(", ");
		return flags.charAt(0).toUpperCase() + flags.slice(1);
	};

	const avatar = user.displayAvatarURL({ size: 2048, dynamic: true });
	const rawFlags = (await user.fetchFlags()).toArray();
	const flags = rawFlags.map((flag) => USER_FLAGS[flag] ?? flag);
	const created = getDate(user.createdTimestamp);
	const tag = user.tag;
	const bot = user.bot;
	const id = user.id;

	const color = !["#000000", "#ffffff"].includes(member.displayHexColor) ? member.displayHexColor : "RANDOM";
	const joined = getDate(member.joinedTimestamp);
	const owner = member.id === member.guild.ownerId;
	const premium = !!member.premiumSince;
	const name = member.displayName;
	const roles = getRoles(member);

	const userEmbed = new MessageEmbed()
		.setAuthor(`${intr.user.tag} (${intr.user.id})`, intr.user.displayAvatarURL())
		.setTimestamp()
		.setColor(color)
		.setThumbnail(avatar)
		.setTitle(name)
		.addField("Tag", tag, true)
		.addField("Id", id, true)
		.addField("Display name", name)
		.addField("Bot", bot ? "Yes" : "No", true)
		.addField("Boosting", premium ? "Yes" : "No", true)
		.addField("Roles", roles)
		.addField("Avatar", `[Link](${avatar})`, true)
		.addField("Color", member.displayHexColor, true)
		.addField("\u200b", "\u200b", true);

	if (flags.length) userEmbed.addField("Badges", parseFlags(flags));
	if (created) userEmbed.addField("Created", created, true);
	if (joined) userEmbed.addField("Joined", joined, true);
	if (owner) userEmbed.setDescription("👑 Server owner");

	intr.editReply({ embeds: [userEmbed] });
}
