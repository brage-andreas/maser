import type { ConfigCommandData } from "../../../typings.js";
import { MessageEmbed } from "discord.js";

export default async function logs(data: ConfigCommandData) {
	const { config, intr, method, option } = data;

	switch (method) {
		case "view": {
			const res = (await config.getChannel()) ?? (await config.getRole());

			const viewOptionEmbed = new MessageEmbed()
				.setAuthor(intr.user.tag, intr.member.displayAvatarURL())
				.setColor(intr.client.colors.try("INVIS"))
				.addField(option, `Value: ${res ? `${res} (${res.id})` : "Not set"}`);

			intr.editReply({ embeds: [viewOptionEmbed] });

			intr.logger.log(`Used method VIEW on option ${option.toUpperCase()}:\n  ${res?.id ?? "Not set"}`);
			break;
		}

		case "set": {
			const res = intr.options.getChannel("channel") ?? intr.options.getRole("role");

			const value = res?.id ?? "null";
			await config.set(value);

			const newValueStr = res ? `${res} (${res.id})` : "Removed";

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
