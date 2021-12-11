import {
	MessageEmbed,
	type CommandInteraction,
	type AllowedImageSize,
	type ChatInputApplicationCommandData
} from "discord.js";
import { type Command } from "../../typings.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { defaultEmbedOptions } from "../../constants.js";

const sizeChoices = [16, 32, 64, 128, 256, 300, 512, 600, 1024, 2048, 4096].map((size) => {
	return {
		name: `${size}px`,
		value: size
	};
});

const data: ChatInputApplicationCommandData = {
	name: "banner",
	description: "Sends a user's banner",
	options: [
		{
			name: "user",
			description: "The user to target. Default is you",
			type: ApplicationCommandOptionTypes.USER
		},
		{
			name: "size",
			description: "Size of the banner. Default is 2048px",
			type: ApplicationCommandOptionTypes.INTEGER,
			choices: sizeChoices
		}
	]
};

type ImageFormats = "webp" | "png" | "jpg";

async function execute(intr: CommandInteraction<"cached">) {
	const userId = (intr.options.get("user")?.value as string | undefined) ?? intr.user.id;
	const member = intr.options.getMember("user");
	const size = (intr.options.getInteger("size") ?? 2048) as AllowedImageSize;

	const { emXMark } = intr.client.systemEmojis;

	const user = await intr.client.users.fetch(userId, { force: true });

	const baseURL = user.bannerURL();

	if (!baseURL) {
		const userStr =
			userId === intr.user.id
				? "You do"
				: userId === intr.client.user!.id
				? "I do"
				: `${user.tag} (${user} ${user.id}) does`;
		intr.editReply(`${emXMark} ${userStr} not have a banner`);
		return;
	}

	const base = baseURL.split(".").slice(0, -1).join(".");

	const getURL = (format: ImageFormats) => `${base}.${format}?size=${size}`;

	const webp = getURL("webp");
	const png = getURL("png");
	const jpg = getURL("jpg");
	const dynamic = user.bannerURL({ size, dynamic: true })!;

	const name = member?.displayName ?? user.username;
	const nameStr = name.endsWith("s") || name.endsWith("z") ? `${name}' banner` : `${name}'s banner`;

	const bannerLinks: string[] = [];
	const isGIF = dynamic.endsWith(`.gif?size=${size}`);
	if (isGIF) bannerLinks.push(`[gif](${dynamic})`);
	bannerLinks.push(`[png](${png}), [jpg](${jpg}), [webp](${webp})`);

	const description =
		`**User**: ${user}\n` + //
		`**Size**: ${size} px\n\n` +
		`**Banner**: ${bannerLinks.join(", ")}`;

	const embed = new MessageEmbed(defaultEmbedOptions(intr))
		.setDescription(description)
		.setTitle(nameStr)
		.setImage(dynamic);

	intr.editReply({ embeds: [embed] });

	intr.logger.log(`Sent banner of ${user.tag} (${user.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
