import type { ApplicationCommandData, Guild } from "discord.js";
import type { CmdIntr } from "../../Typings.js";

import { MessageEmbed } from "discord.js";
import Util from "../../utils/index.js";

export const data: ApplicationCommandData = {
	name: "server",
	description: "Sends information about this server"
};

export async function execute(intr: CmdIntr) {
	const applyS = (string: string, size: number) => (size !== 1 ? string + "s" : string);
	const { guild } = intr;

	const getRoles = (guild: Guild) => {
		const roles = guild.roles.cache;
		if (roles.size === 1) return null;

		const sortedRoles = roles.sort((a, b) => b.position - a.position);
		const parsedRoles = sortedRoles.map((role) => role.toString()).slice(0, -1); // removes @everyone

		const fourRoles = parsedRoles.slice(0, 4).join(", ");
		const excess = parsedRoles.length - 4;
		const excessStr = excess > 0 ? `, and ${excess} more` : "";

		return fourRoles + excessStr;
	};

	const getEmojisAndStickers = (guild: Guild) => {
		const emojis = guild.emojis.cache;
		const stickers = guild.stickers.cache;
		const normalEmojis = emojis.filter((em) => em.animated === false).size;
		const animatedEmojis = emojis.filter((em) => em.animated === true).size;

		const emojiCount = emojis.size;
		const stickerCount = stickers.size;

		let string = "";
		if (!emojiCount) return `No emojis and ${stickerCount || "no"} ${applyS("sticker", stickerCount)}`;

		string += `**${emojis.size}** ${applyS("emoji", emojis.size)}\n`;
		string += `${normalEmojis} ${applyS("emoji", normalEmojis)}, `;
		string += `${animatedEmojis} animated ${applyS("emoji", animatedEmojis)}, `;
		string += `and ${stickerCount || "no"} ${applyS("sticker", stickerCount)}`;

		return string;
	};

	const _channels = guild.channels.cache;
	const voiceChannels = _channels.filter((ch) => ch.isVoice()).size;
	const textChannels = _channels.filter((ch) => ch.isText() && !ch.isThread()).size;
	const channels = _channels.size;

	const partnered = guild.partnered;
	const boosters = guild.premiumSubscriptionCount;
	const verified = guild.verified;
	const created = Util.Date(guild.createdAt);
	const vanity = guild.vanityURLCode;
	const roles = getRoles(guild);
	const icon = guild.iconURL({ size: 2048, dynamic: true }) ?? "";
	const tier = guild.premiumTier.replace("_", " ").toLowerCase();
	const name = guild.name;

	const vanityStr = vanity ? `with vanity \`${vanity}\`` : "";

	const textChs = `${textChannels} ${applyS("text-channel", textChannels)}`;
	const voiceChs = `${voiceChannels} ${applyS("voice-channel", voiceChannels)}`;
	const channelsStr = [`**${channels}** in total`, `${textChs} and ${voiceChs}`].join("\n");

	const emojisAndStickerStr = getEmojisAndStickers(guild);

	const guildEmbed = new MessageEmbed()
		.setAuthor(`${intr.user.tag} (${intr.user.id})`, intr.user.displayAvatarURL())
		.setTimestamp()
		.setColor(intr.client.colors.try("YELLOW"))
		.setThumbnail(icon)
		.setTitle(name);

	if (partnered && !verified) guildEmbed.setDescription(`A Discord partner ${vanityStr}`);
	if (verified) guildEmbed.setDescription(`A verified server ${vanityStr}`);
	if (roles) guildEmbed.addField("Roles", roles);

	guildEmbed
		.addField("Created", created)
		.addField("Channels", channelsStr)
		.addField("Emojis", emojisAndStickerStr)
		.addField("Boosting", boosters ? `Server is ${tier} with **${boosters}** boosts` : "No boosts");

	intr.editReply({ embeds: [guildEmbed] });

	intr.logger.log(`Sent info of ${guild.name} (${guild.id})`);
}
