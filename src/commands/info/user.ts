import {
	ApplicationCommandOptionType,
	type ChatInputApplicationCommandData,
	type CommandInteraction
} from "discord.js";
import { newDefaultEmbed, USER_FLAGS } from "../../constants/index.js";
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

	const parseFlags = (flagArray: string[]) => {
		const flags = flagArray.join(", ");

		return flags.charAt(0).toUpperCase() + flags.slice(1);
	};

	const getColor = (hex: number | undefined) => {
		const { green } = intr.client.colors;

		if (!hex) return green;
		const empty = hex === 0x000000 || hex === 0xffffff;

		return empty ? green : hex;
	};

	const rawFlags = (await user.fetchFlags()).toArray();
	const created = Util.date(user.createdTimestamp);
	const avatar = (member ?? user).displayAvatarURL({ size: 2048 });
	const flags = rawFlags.map((flag) => USER_FLAGS[flag] ?? flag);
	const { bot, tag, id } = user;
	const premium = Boolean(member?.premiumSince);
	const joined = member?.joinedTimestamp ? Util.date(member.joinedTimestamp) : null;
	const color = getColor(member?.displayColor);
	const owner = Boolean(member) && member!.id === member?.guild.ownerId;
	const roles = Util.parseRoles(member);
	const name = member?.displayName ?? user.tag;
	const userEmbed = newDefaultEmbed(intr).setColor(color).setThumbnail(avatar).setTitle(name);

	if (member) userEmbed.addField({ name: "Tag", value: tag });

	userEmbed.addFields(
		{ name: "ID", value: id },
		{ name: "Bot", value: bot ? "Yes" : "No" },
		{ name: "Avatar", value: `[Link](${avatar})` },
		{ name: "Badges", value: flags.length ? parseFlags(flags) : "No badges" },
		{ name: "Created", value: created }
	);

	if (member)
		userEmbed.addFields(
			{ name: "Roles", value: roles ?? "No roles" },
			{ name: "Boosting", value: premium ? "Yes" : "No" },
			{ name: "Color", value: member.displayHexColor }
		);

	if (joined) userEmbed.addField({ name: "Joined", value: joined });

	if (owner) userEmbed.setDescription("👑 Server owner");

	intr.editReply({ embeds: [userEmbed] });

	intr.logger.log(`Sent info of ${user.tag} (${user.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
