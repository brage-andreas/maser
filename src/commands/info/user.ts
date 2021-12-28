import { MessageEmbed, type ChatInputApplicationCommandData, type CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { defaultEmbedOptions, USER_FLAGS } from "../../constants/index.js";
import { type Command } from "../../typings/index.js";
import Util from "../../utils/index.js";

const data: ChatInputApplicationCommandData = {
	name: "user",
	description: "Sends information about a user",
	options: [
		{
			name: "user",
			description: "The user to target",
			type: ApplicationCommandOptionTypes.USER
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

	const getColor = (hex: `#${string}` | undefined) => {
		const { green } = intr.client.colors;

		if (!hex) return green;
		const empty = hex === "#000000" || hex.toLowerCase() === "#ffffff";

		return empty ? green : hex;
	};

	const rawFlags = (await user.fetchFlags()).toArray();
	const created = Util.date(user.createdTimestamp);
	const avatar = (member ?? user).displayAvatarURL({ size: 2048, dynamic: true });
	const flags = rawFlags.map((flag) => USER_FLAGS[flag] ?? flag);
	const { bot, tag, id } = user;
	const premium = Boolean(member?.premiumSince);
	const joined = member?.joinedTimestamp ? Util.date(member.joinedTimestamp) : null;
	const color = getColor(member?.displayHexColor);
	const owner = Boolean(member) && member!.id === member?.guild.ownerId;
	const roles = Util.parseRoles(member);
	const name = member?.displayName ?? user.tag;
	const userEmbed = new MessageEmbed(defaultEmbedOptions(intr)).setColor(color).setThumbnail(avatar).setTitle(name);

	if (member) userEmbed.addField("Tag", tag);

	userEmbed
		.addField("ID", id)
		.addField("Bot", bot ? "Yes" : "No", true)
		.addField("Avatar", `[Link](${avatar})`)
		.addField("Badges", flags.length ? parseFlags(flags) : "No badges")
		.addField("Created", created, true);

	if (member)
		userEmbed
			.addField("Roles", roles ?? "No roles")
			.addField("Boosting", premium ? "Yes" : "No", true)
			.addField("Color", member.displayHexColor);

	if (joined) userEmbed.addField("Joined", joined, true);

	if (owner) userEmbed.setDescription("👑 Server owner");

	intr.editReply({ embeds: [userEmbed] });

	intr.logger.log(`Sent info of ${user.tag} (${user.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
