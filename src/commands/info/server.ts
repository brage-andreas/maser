/* eslint-disable padding-line-between-statements */
import { type APIEmbed } from "discord-api-types/v9";
import { type ChatInputApplicationCommandData, type CommandInteraction, type Guild } from "discord.js";
import { BOOST_LEVELS, defaultEmbed } from "../../constants/index.js";
import { type Command } from "../../typings/index.js";
import Util from "../../utils/index.js";

const data: ChatInputApplicationCommandData = {
	name: "server",
	description: "Sends information about this server"
};

function execute(intr: CommandInteraction<"cached">) {
	const applyS = (string: string, size: number) => (size !== 1 ? `${string}s` : string);
	const { guild } = intr;

	const getEmojisAndStickers = (guild: Guild) => {
		const emojiAmount = guild.emojis.cache.size;
		const stickerAmount = guild.stickers.cache.size;

		const standardEmojisAmount = guild.emojis.cache.filter((em) => em.animated === false).size;
		const animatedEmojisAmount = guild.emojis.cache.filter((em) => em.animated === true).size;

		const emojiAmountStr = `${emojiAmount ? `**${emojiAmount}**` : "No"} ${applyS("emoji", emojiAmount)}`;
		const stickerAmountStr = `${stickerAmount || "no"} ${applyS("sticker", stickerAmount)}`;

		const standardEmojiAmountStr = `${standardEmojisAmount || "no"} normal ${applyS(
			"emoji",
			standardEmojisAmount
		)}`;

		const animatedEmojiAmountStr = `${animatedEmojisAmount || "no"} animated ${applyS(
			"emoji",
			animatedEmojisAmount
		)}`;

		const str = emojiAmount
			? `${emojiAmountStr} in total\n${standardEmojiAmountStr}, ${animatedEmojiAmountStr}, and ${stickerAmountStr}`
			: `${emojiAmountStr} and ${stickerAmountStr}`;

		return str;
	};

	const voiceChannels = guild.channels.cache.filter((ch) => ch.isVoice()).size;
	const textChannels = guild.channels.cache.filter((ch) => ch.isText() && !ch.isThread()).size;
	const channels = guild.channels.cache.size;

	const { partnered, verified, name, vanityURLCode: vanity, premiumSubscriptionCount: boosters } = guild;

	const vanityStr = vanity ? `with vanity \`${vanity}\`` : "";
	const created = Util.fullDate(guild.createdAt);
	const roles = Util.parseRoles(guild);
	const icon = guild.iconURL({ size: 2048 }) ?? "";
	const tier = BOOST_LEVELS[guild.premiumTier];

	const totalChs = `**${channels}** ${applyS("channel", channels)}`;
	const textChs = `${textChannels} text ${applyS("channel", textChannels)}`;
	const voiceChs = `${voiceChannels} voice ${applyS("channel", voiceChannels)}`;
	const channelsStr = `${totalChs} in total\n${textChs} and ${voiceChs}`;

	const emojisAndStickerStr = getEmojisAndStickers(guild);
	const guildEmbed: APIEmbed = {
		...defaultEmbed(intr),
		thumbnail: { url: icon },
		title: name,
		fields: [
			{ name: "Roles", value: roles },
			{ name: "Created", value: created },
			{ name: "Members", value: `**${guild.memberCount}** ${applyS("member", guild.memberCount)}` },
			{ name: "Channels", value: channelsStr },
			{ name: "Emojis", value: emojisAndStickerStr },
			{
				name: "Boosting",
				value: boosters ? `Server has ${tier} with **${boosters}** ${applyS("boost", boosters)}` : "No boosts"
			}
		]
	};

	if (verified || partnered)
		if (verified && !partnered) guildEmbed.description = `A verified server ${vanityStr}`;
		else if (partnered && !verified) guildEmbed.description = `A partnered server ${vanityStr}`;
		else guildEmbed.description = `A verified and partnered server ${vanityStr}`;

	intr.editReply({ embeds: [guildEmbed] });

	intr.logger.log(`Sent info of ${guild.name} (${guild.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
