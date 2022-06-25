import { oneLine } from "common-tags";
import { type APIEmbed } from "discord-api-types/v9";
import {
	ChannelType,
	type ChatInputApplicationCommandData,
	type CommandInteraction,
	type Guild
} from "discord.js";
import { BOOST_LEVELS, defaultEmbed } from "../../constants/index.js";
import type Logger from "../../loggers/index.js";
import { type Command } from "../../typings/index.js";
import { bold } from "../../utils/discordMarkdown.js";
import { fullDate, listify } from "../../utils/index.js";

const data: ChatInputApplicationCommandData = {
	name: "server",
	description: "Sends information about this server"
};

function execute(intr: CommandInteraction<"cached">, logger: Logger) {
	const applyS = (str: string, n: number) => (n === 1 ? str : `${str}s`);

	const { guild } = intr;

	const getEmojisAndStickers = (guild: Guild) => {
		const emojiAmount = guild.emojis.cache.size;
		const stickerAmount = guild.stickers.cache.size;

		const standardEmojiAmount = guild.emojis.cache.filter(
			(em) => !em.animated
		).size;

		const animatedEmojiAmount = emojiAmount - standardEmojiAmount;

		// e.g. "**1** emoji", "No emojis", "**20** emojis"
		const emojiStr = oneLine`
			${emojiAmount ? bold`${emojiAmount}` : "No"}
			${applyS("emoji", emojiAmount)}
		`;

		const stickerStr = oneLine`
			${stickerAmount || "no"}
			${applyS("sticker", stickerAmount)}
		`;

		const standardEmojiStr = oneLine`
			${standardEmojiAmount || "no"}
			normal ${applyS("emoji", standardEmojiAmount)}
		`;

		const animatedEmojiAmountStr = oneLine`
			${animatedEmojiAmount || "no"}
			animated ${applyS("emoji", animatedEmojiAmount)}
		`;

		if (emojiAmount) {
			return oneLine`
				${emojiStr} in total\n${standardEmojiStr},
				${animatedEmojiAmountStr}, and ${stickerStr}
			`;
		}

		return `${emojiStr} and ${stickerStr}`;
	};

	const voiceChs = guild.channels.cache.filter(
		(ch) =>
			ch.type === ChannelType.GuildVoice ||
			ch.type === ChannelType.GuildStageVoice
	).size;

	const textChs = guild.channels.cache.filter(
		(ch) => ch.isTextBased() && !ch.isThread()
	).size;

	const channels = guild.channels.cache.size;

	const {
		partnered,
		verified,
		name,
		vanityURLCode: vanity,
		premiumSubscriptionCount: boosters
	} = guild;

	const vanityStr = vanity ? `with vanity \`${vanity}\`` : "";
	const created = fullDate(guild.createdAt);

	const roles = listify(
		guild.roles.cache
			.sort((a, b) => b.position - a.position)
			.map((r) => r.toString()),
		{ desiredLen: 4, give: 1 }
	);

	const icon = guild.iconURL({ size: 2048 }) ?? "";
	const tier = BOOST_LEVELS[guild.premiumTier];

	const totalChStr = `${bold`${channels}`} ${applyS("channel", channels)}`;
	const textChStr = `${textChs} text ${applyS("channel", textChs)}`;
	const voiceChStr = `${voiceChs} voice ${applyS("channel", voiceChs)}`;
	const channelsStr = `${totalChStr} in total\n${textChStr} and ${voiceChStr}`;

	const emojisAndStickerStr = getEmojisAndStickers(guild);
	const guildEmbed: APIEmbed = {
		...defaultEmbed(intr),
		thumbnail: { url: icon },
		title: name,
		fields: [
			{
				name: "Roles",
				value: roles
			},
			{
				name: "Created",
				value: created
			},
			{
				name: "Members",
				value: oneLine`
					${bold`${guild.memberCount}`}
					${applyS("member", guild.memberCount)}
				`
			},
			{
				name: "Channels",
				value: channelsStr
			},
			{
				name: "Emojis",
				value: emojisAndStickerStr
			},
			{
				name: "Boosting",
				value: boosters
					? oneLine`
					  	Server has ${tier} with ${bold`${boosters}`}
						${applyS("boost", boosters)}
					  `
					: "No boosts"
			}
		]
	};

	if (verified || partnered) {
		if (verified && !partnered) {
			guildEmbed.description = `A verified server ${vanityStr}`;
		} else if (partnered && !verified) {
			guildEmbed.description = `A partnered server ${vanityStr}`;
		} else {
			guildEmbed.description = `A verified and partnered server ${vanityStr}`;
		}
	}

	intr.editReply({ embeds: [guildEmbed] });

	logger.logInteraction();
}

export const getCommand = () =>
	({
		data,
		execute
	} as Partial<Command>);
