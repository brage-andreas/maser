import type { AllowedImageSize, ApplicationCommandData, GuildMember } from "discord.js";
import type { CmdIntr } from "../../typings.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { MessageEmbed } from "discord.js";

export const data: ApplicationCommandData = {
	name: "avatar",
	description: "Sends a user's avatar",
	options: [
		{
			name: "user",
			description: "The user to target. Default is you",
			type: ApplicationCommandOptionType.User as number
		},
		{
			name: "size",
			description: "Size of the image. Default is 2048px",
			type: ApplicationCommandOptionType.Integer as number,
			choices: Array.apply(null, Array(9)).map((_, i) => ({
				name: `${2 ** (i + 4)}px`,
				value: 2 ** (i + 4)
			}))
		},
		{
			name: "guild-avatar",
			description: "Include guild avatars. Default is true",
			type: ApplicationCommandOptionType.Boolean as number
		}
	]
};

type ImageFormats = "webp" | "png" | "jpg";

export async function execute(intr: CmdIntr) {
	const includeGuildAvatar = intr.options.getBoolean("guild-avatar") ?? true;
	const member = intr.options.getMember("user") as GuildMember | null;
	const size = (intr.options.getInteger("size") ?? 2048) as AllowedImageSize;
	const user = intr.options.getUser("user") ?? intr.user;

	const target = includeGuildAvatar && member ? member : user;

	const baseURL = target.displayAvatarURL();
	const base = baseURL.split(".").slice(0, -1).join(".");

	const getURL = (format: ImageFormats) => `${base}.${format}?size=${size}`;

	const webp = getURL("webp");
	const png = getURL("png");
	const jpg = getURL("jpg");
	const dynamic = target.displayAvatarURL({ size, dynamic: true });

	const name = member && !member.pending ? member.displayName : user.username;
	const nameStr = name.endsWith("s") || name.endsWith("z") ? `${name}' avatar` : `${name}'s avatar`;

	const description: string[] = [];

	const isGIF = dynamic.endsWith(`.gif?size=${size}`);
	if (isGIF) description.push(`[gif](${dynamic})`);

	description.push(`[png](${png}) [jpg](${jpg}) [webp](${webp})`);

	const embed = new MessageEmbed()
		.setAuthor(intr.user.tag, intr.user.displayAvatarURL())
		.setColor(intr.client.colors.try("INVIS"))
		.setDescription(description.join(" "))
		.setTitle(nameStr)
		.setImage(dynamic)
		.setTimestamp();

	intr.editReply({ embeds: [embed] });

	intr.logger.log(`Sent avatar of ${user.tag} (${user.id})`);
}
