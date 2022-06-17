import {
	ApplicationCommandOptionType,
	type APIEmbed,
	type ChatInputApplicationCommandData,
	type CommandInteraction
} from "discord.js";
import {
	COLORS,
	defaultEmbed,
	USER_FLAGS_STRINGS
} from "../../constants/index.js";
import type Logger from "../../loggers/index.js";
import { type Command } from "../../typings/index.js";
import {
	createList,
	escapeDiscordMarkdown,
	fullDate,
	listify
} from "../../utils/index.js";

const data: ChatInputApplicationCommandData = {
	name: "user",
	description: "Sends information about a user",
	options: [
		{
			name: "user",
			description: "The user to target (You)",
			type: ApplicationCommandOptionType.User
		}
	]
};

async function execute(intr: CommandInteraction<"cached">, logger: Logger) {
	const userOptionIsProvided = Boolean(intr.options.get("user")?.value);

	const member = userOptionIsProvided
		? intr.options.getMember("user")
		: intr.member;

	const user = userOptionIsProvided
		? intr.options.getUser("user", true)
		: intr.user;

	await user.fetch(true);

	const getColor = (hex: number | undefined) =>
		hex === undefined ? COLORS.green : hex;

	const premium = Boolean(member?.premiumSinceTimestamp);
	const owner = Boolean(member) && member!.id === member?.guild.ownerId;

	const rawFlags = (await user.fetchFlags()).toArray();
	const flags = rawFlags.map((flag) => USER_FLAGS_STRINGS[flag] ?? flag);

	if (premium) {
		flags.push("Booster");
	}

	const memberAvatar = member?.avatarURL({ size: 2048 }) ?? null;
	const userAvatar = user.displayAvatarURL({ size: 2048 });

	const displayAvatar = memberAvatar ?? userAvatar;
	const banner = user.bannerURL({ size: 2048 });

	const joined = member?.joinedTimestamp
		? fullDate(member.joinedTimestamp)
		: null;

	const color = getColor(member?.displayColor);

	const created = fullDate(user.createdTimestamp);

	const hoistedRole = member?.roles.hoist ?? null;
	const coloredRole = member?.roles.color ?? null;
	const iconRole = member?.roles.icon ?? null;

	const something = createList({
		"Roles":
			member &&
			listify(
				member.roles.cache.map((r) => r.toString()),
				{ desiredLen: 5, give: 1 }
			),

		"Hoisted": hoistedRole?.toString(),
		"Coloured": coloredRole?.toString(),
		"Icon:":
			iconRole &&
			`${iconRole} ([Link to icon](${iconRole.iconURL({
				size: 1024
			})}))`
	});

	const { bot, tag, id } = user;

	const name = escapeDiscordMarkdown(member?.displayName ?? tag);

	const infoFieldValue = createList({
		"Tag": `\`${tag}\``,
		"ID": `\`${id}\``,
		"Colour": `\`#${color.toString(16)}\``,
		"👑 Server Owner": owner ? "{single}" : null,
		"Bot": bot ? "{single}" : null,
		"Created": created,
		"Joined": joined,
		"User avatar": `[Link](${userAvatar} "Link to user avatar")`,
		"Member avatar": memberAvatar
			? `[Link](${memberAvatar} "Link to member avatar")`
			: null,
		"Banner": banner ? `[Link](${banner} "Link to banner")` : null,
		"Accent colour": user.hexAccentColor
	});

	const userEmbed: APIEmbed = {
		...defaultEmbed(intr),
		thumbnail: { url: displayAvatar },
		footer: {
			icon_url: iconRole?.iconURL({ size: 1024 }) ?? "",
			text: hoistedRole?.name ?? ""
		},
		image: { url: banner ?? "" },
		title: name,
		color,
		fields: [
			{
				name: "Info",
				value: infoFieldValue
			},
			{
				name: "Badges",
				value: flags.length ? `• ${flags.join("\n• ")}` : "None"
			}
		]
	};

	if (member) {
		userEmbed.fields!.push({
			name: `Roles (${member.roles.cache.size - 1})`,
			value: 1 < member.roles.cache.size ? something : "No roles"
		});
	}

	intr.editReply({ embeds: [userEmbed] });

	logger.logInteraction(`Sent info of ${user.tag} (${user.id})`);
}

export const getCommand = () =>
	({
		data,
		execute
	} as Partial<Command>);
