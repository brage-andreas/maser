import { MessageEmbed } from "discord.js";
import type { AllowedConfigTextChannels, ConfigCommandData } from "../../../typings.js";

export default async function logs(data: ConfigCommandData) {
	const { config, intr, method, option } = data;

	const getManager = () => {
		if (option === "member-log") return config.memberLog;
		if (option === "bot-log") return config.botLog;
	};

	const base = getManager();
	if (!base) return intr.editReply("Something went wrong. How did you manage this?");

	switch (method) {
		case "view": {
			const channel = await base.get<AllowedConfigTextChannels>();
			const name = intr.member.displayName;

			const viewOptionEmbed = new MessageEmbed()
				.setAuthor(intr.user.tag, intr.member.displayAvatarURL())
				.setColor(intr.client.colors.try("INVIS"))
				.addField(option, `Value: ${channel ? `${channel} (${channel.id})` : "Not set"}`);

			intr.editReply({ embeds: [viewOptionEmbed] });

			intr.logger.log(`Used method VIEW on option ${option.toUpperCase()}:\n  ${channel?.id ?? "Not set"}`);
			break;
		}

		case "set": {
			const channel = intr.options.getChannel("channel");

			const value = channel?.id ?? "null";
			await base.set(value);

			const newValueStr = channel ? `${channel} (${channel.id})` : "Removed";

			const viewOptionEmbed = new MessageEmbed()
				.setAuthor(intr.user.tag, intr.member.displayAvatarURL())
				.setColor(intr.client.colors.try("INVIS"))
				.addField(option, `New value: ${newValueStr}`);

			intr.editReply({ embeds: [viewOptionEmbed] });

			intr.logger.log(`Used method SET on option ${option.toUpperCase()}:\n  ${value}`);
			break;
		}

		default: {
			break;
		}
	}
}
