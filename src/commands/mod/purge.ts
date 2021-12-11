import {
	type CommandInteraction,
	type ChatInputApplicationCommandData,
	type NewsChannel,
	type TextChannel
} from "discord.js";
import { type Command } from "../../typings/index.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";

const options = {
	private: true
};

const data: ChatInputApplicationCommandData = {
	name: "purge",
	description: "Deletes messages in a channel",
	options: [
		{
			name: "amount",
			description: "The amount of messages to delete (1 - 100)",
			type: ApplicationCommandOptionTypes.INTEGER,
			required: true
		},
		{
			name: "reason",
			description: "The reason for this purge",
			type: ApplicationCommandOptionTypes.STRING
		},
		{
			name: "channel",
			description: "The channel to delete messages in. Default is current channel",
			type: ApplicationCommandOptionTypes.CHANNEL,
			channelTypes: ["GUILD_TEXT", "GUILD_NEWS"]
		},
		{
			name: "pins",
			description: "Delete pinned messages. Default is false.",
			type: ApplicationCommandOptionTypes.BOOLEAN
		}
	]
};

async function execute(intr: CommandInteraction<"cached">) {
	const desiredAmount = intr.options.getInteger("amount", true);
	const reason = intr.options.getString("reason");
	const channel = (intr.options.getChannel("channel") ?? intr.channel) as TextChannel | NewsChannel;
	const pins = intr.options.getBoolean("pins") ?? false;

	const { emBug, emUserLock, emSuccess, emError, emChannel, emCheckMark, emXMark } = intr.client.systemEmojis;

	if (!channel) {
		intr.editReply(`${emBug} Something went wrong with the channel`);
		return;
	}

	if (!intr.guild.me?.permissions.has("MANAGE_MESSAGES") || !channel.viewable) {
		intr.editReply(`${emUserLock} I don't have permissions to delete messages in ${channel}`);
		return;
	}

	if (desiredAmount > 100 || desiredAmount < 1) {
		intr.editReply(`${emXMark} The amount must be between 1 and 100 (reading ${desiredAmount})`);
		return;
	}

	// To not delete the bot's own reply
	const { id } = await intr.fetchReply();
	const target = await channel.messages
		.fetch({ before: id, limit: desiredAmount })
		.then((msgs) => (!pins ? msgs.filter((msg) => !msg.pinned) : msgs));

	const info =
		`• **Reason**: ${reason ?? "No reason provided"}\n` +
		`• **Amount**: ${target.size === desiredAmount ? target.size : `${target.size} (desired ${desiredAmount})`}\n` +
		`• **Channel**: ${emChannel}${channel.name} (${channel} ${channel.id})`;

	const collector = new ConfirmationButtons({ author: intr.user })
		.setInteraction(intr)
		.setUser(intr.user)
		.setQuery(`Are you sure?\n\n${info}`);

	collector
		.start({ noReply: true })
		.then(async () => {
			await channel
				.bulkDelete(target, true)
				.then(() => {
					intr.editReply({ content: `${emSuccess} Done!\n\n${info}`, components: [] });
				})
				.catch(() => {
					intr.editReply({
						content: `${emError} I failed to delete the messages\n\n${info}`,
						components: []
					});
				});
		})
		.catch(() => {
			intr.editReply({ content: `${emCheckMark} Gotcha. Command canceled`, components: [] });
		});

	intr.logger.log(`Pruned ${target.size} messages in #${channel.name} (${channel.id})`);
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
