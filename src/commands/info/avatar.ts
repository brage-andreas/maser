import type { CmdIntr } from "../../typings.js";
import type { AllowedImageSize, ApplicationCommandData, GuildMember } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { MessageEmbed } from "discord.js";

export const data: ApplicationCommandData = {
	name: "avatar",
	description: "Sends a user's avatar",
	options: [
		{
			name: "user",
			description: "The user to target",
			type: ApplicationCommandOptionType.User as number
		},
		{
			name: "size",
			description: "Size of the image. 2048px is default",
			type: ApplicationCommandOptionType.Integer as number,
			choices: Array.apply(null, Array(9)).map((_, i) => ({ name: `${2 ** (i + 4)}px`, value: 2 ** (i + 4) }))
		}
	]
};

type ImageFormats = "webp" | "png" | "jpg";

export async function execute(intr: CmdIntr) {
	const user = intr.options.getUser("user") ?? intr.user;
	const member = intr.options.getMember("user") as GuildMember | null;
	const size = (intr.options.getInteger("size") ?? 2048) as AllowedImageSize;

	const base = user.displayAvatarURL().split(".").slice(0, -1).join(".");

	const getURL = (format: ImageFormats) => `${base}.${format}?size=${size}`;

	const webp = getURL("webp");
	const png = getURL("png");
	const jpg = getURL("jpg");
	const dynamic = user.displayAvatarURL({ size, dynamic: true });

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
