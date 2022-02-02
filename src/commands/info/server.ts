import { type ChatInputApplicationCommandData, type CommandInteraction, type Guild } from "discord.js";
import { newDefaultEmbed } from "../../constants/index.js";
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
		const total = guild.emojis.cache.size;
		const sticker = guild.stickers.cache.size;
		const standard = guild.emojis.cache.filter((em) => em.animated === false).size;
		const animated = guild.emojis.cache.filter((em) => em.animated === true).size;
		const totalStr = `${total ? `**${total}**` : "No"} ${applyS("emoji", total)}`;
		const stickerStr = `${sticker || "no"} ${applyS("sticker", sticker)}`;
		const standardStr = `${standard || "no"} ${applyS("emoji", standard)}`;
		const animatedStr = `${animated || "no"} animated ${applyS("emoji", animated)}`;

		const str = total
			? `${totalStr} in total\n${standardStr}, ${animatedStr}, and ${stickerStr}`
			: `${totalStr} and ${stickerStr}`;

		return str;
	};

	const _channels = guild.channels.cache;
	const voiceChannels = _channels.filter((ch) => ch.isVoice()).size;
	const textChannels = _channels.filter((ch) => ch.isText() && !ch.isThread()).size;
	const channels = _channels.size;
	const { partnered, verified, name } = guild;
	const vanity = guild.vanityURLCode;
	const vanityStr = vanity ? `with vanity \`${vanity}\`` : "";
	const boosters = guild.premiumSubscriptionCount;
	const created = Util.date(guild.createdAt);
	const roles = Util.parseRoles(guild);
	const icon = guild.iconURL({ size: 2048 }) ?? "";
	const tier = guild.premiumTier;
	const totalChs = `**${channels}** ${applyS("channel", channels)}`;
	const textChs = `${textChannels} text ${applyS("channel", textChannels)}`;
	const voiceChs = `${voiceChannels} voice ${applyS("channel", voiceChannels)}`;
	const channelsStr = `${totalChs} in total\n${textChs} and ${voiceChs}`;
	const emojisAndStickerStr = getEmojisAndStickers(guild);
	const guildEmbed = newDefaultEmbed(intr).setThumbnail(icon).setTitle(name);

	if (partnered && !verified) guildEmbed.setDescription(`A Discord partner ${vanityStr}`);

	if (verified) guildEmbed.setDescription(`A verified server ${vanityStr}`);

	guildEmbed.addField({ name: "Roles", value: roles });

	guildEmbed.addFields(
		{ name: "Created", value: created },
		{ name: "Members", value: `**${guild.memberCount}** ${applyS("member", guild.memberCount)}` },
		{ name: "Channels", value: channelsStr },
		{ name: "Emojis", value: emojisAndStickerStr },
		{
			name: "Boosting",
			value: boosters ? `Server has ${tier} with **${boosters}** ${applyS("boost", boosters)}` : "No boosts"
		}
	);

	intr.editReply({ embeds: [guildEmbed] });

	intr.logger.log(`Sent info of ${guild.name} (${guild.id})`);
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
