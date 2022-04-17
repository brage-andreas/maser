import { type APIButtonComponentWithCustomId, ComponentType, type APIEmbed } from "discord-api-types/v9";
import {
	ApplicationCommandOptionType,
	ButtonStyle,
	User,
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction,
	type GuildMember
} from "discord.js";
import { defaultEmbed } from "../../constants/index.js";
import { ButtonManager } from "../../modules/index.js";
import { type Command, type ImageSizes } from "../../typings/index.js";

const sizeChoices = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096].map((size) => ({
	name: `${size}px`,
	value: size
}));

const data: ChatInputApplicationCommandData = {
	name: "avatar",
	description: "Sends a user's avatar",
	options: [
		{
			name: "user",
			description: "The user to target (You)",
			type: ApplicationCommandOptionType.User
		},
		{
			name: "size",
			description: "Size of the image (2048px)",
			type: ApplicationCommandOptionType.Integer,
			choices: sizeChoices
		},
		{
			name: "guild-avatar",
			description: "Include guild avatars (True)",
			type: ApplicationCommandOptionType.Boolean
		}
	]
};

async function execute(intr: ChatInputCommandInteraction<"cached">) {
	const userOptionIsProvided = Boolean(intr.options.get("user")?.value);
	const member = userOptionIsProvided ? intr.options.getMember("user") : intr.member;
	const user = userOptionIsProvided ? intr.options.getUser("user", true) : intr.user;
	const includeGuildAvatar = intr.options.getBoolean("guild-avatar") ?? true;
	const hasGuildAvatar = Boolean(member?.avatar);
	const size = (intr.options.getInteger("size") ?? 2048) as ImageSizes;

	const getURL = (target: GuildMember | User, format: string) => {
		const { discriminator } = target instanceof User ? target : target.user;
		const defaultBase = `https://cdn.discordapp.com/embed/avatars/${Number(discriminator) % 5}`;
		const customBase = `https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}`;

		return target.avatar ? `${customBase}.${format}?size=${size}` : `${defaultBase}.${format}`;
	};

	const getAvatarLinks = (target: GuildMember | User, altText: string) => {
		const arr = ["png", "jpg", "webp"].map(
			(format) => `[${format}](${getURL(user, format)} "${altText.replace("{format}", format)}")`
		);

		if (target.displayAvatarURL().endsWith(".gif"))
			arr.splice(0, 0, `[${"gif"}](${getURL(user, "gif")} "${altText.replace("{format}", "gif")}")`);

		return arr;
	};

	// default avatars can only be png
	const userAvatarLinks = user.avatar
		? getAvatarLinks(user, "Avatar in {format} format")
		: [`[png](${getURL(user, "png")} "Avatar in png format")`];

	const guildAvatarLinks = member ? getAvatarLinks(member, "Guild avatar in {format} format") : null;
	const avatar = includeGuildAvatar ? (member ?? user).displayAvatarURL({ size }) : user.displayAvatarURL({ size });

	const description = `**User**: ${user}\n${user.avatar ? `**Size**: ${size} px\n\n` : "\n"}${
		hasGuildAvatar ? `**Guild avatar**: ${guildAvatarLinks!.join(", ")}\n` : ""
	}**Avatar**: ${userAvatarLinks.join(", ")}`;

	const embed: APIEmbed = { ...defaultEmbed(intr), title: "Avatar", description, image: { url: avatar } };
	const buttonManager = new ButtonManager();

	const outputButton: APIButtonComponentWithCustomId = {
		custom_id: "user",
		disabled: !includeGuildAvatar,
		style: ButtonStyle.Secondary,
		label: "User avatar",
		emoji: { name: "🙃" },
		type: ComponentType.Button
	};

	const codeButton: APIButtonComponentWithCustomId = {
		custom_id: "member",
		disabled: includeGuildAvatar,
		style: ButtonStyle.Secondary,
		label: "Guild avatar",
		emoji: { name: "😗" },
		type: ComponentType.Button
	};

	if (hasGuildAvatar) {
		buttonManager.setRows([outputButton, codeButton]);

		embed.footer = { text: "Buttons last for 30 seconds" };
	}

	const msg = await intr.editReply({ embeds: [embed], components: buttonManager.rows });

	if (hasGuildAvatar) {
		const collector = buttonManager.setMessage(msg).createCollector({ time: "30s" });

		collector.on("collect", async (interaction) => {
			if (interaction.user.id !== intr.user.id) {
				interaction.reply({
					content: `${intr.client.maserEmojis.cross} This button is not for you`,
					ephemeral: true
				});

				return;
			}

			await interaction.deferUpdate();

			if (interaction.customId === "user") {
				embed.image = { url: user.displayAvatarURL({ size }) };

				buttonManager.disable("user").enable("member");

				await interaction.editReply({ embeds: [embed], components: buttonManager.rows });
			}
			//
			else if (interaction.customId === "member") {
				embed.image = { url: (member ?? user).displayAvatarURL({ size }) };

				buttonManager.disable("member").enable("user");

				await interaction.editReply({ embeds: [embed], components: buttonManager.rows });
			}
		});

		collector.on("end", () => {
			embed.footer = { text: "" };

			msg.edit({ embeds: [embed], components: [] }).catch(() => null);
		});
	}

	intr.logger.log(`Sent avatar of ${user.tag} (${user.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
