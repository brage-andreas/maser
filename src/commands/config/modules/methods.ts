import type { AllowedConfigTextChannels, ConfigCommandData } from "../../../typings.js";
import type { Role } from "discord.js";
import { MessageEmbed } from "discord.js";

export default async function logs(data: ConfigCommandData) {
	const { config, intr, method, option } = data;

	const { emEmptyFile, emAt, emFileGreen, emChannel } = intr.client.systemEmojis;

	switch (method) {
		case "view": {
			const channel = await config.getChannel();
			const role = await config.getRole();

			const getValueStr = (value: Role | AllowedConfigTextChannels, emoji: string) => {
				return `${emoji}Value: ${value} (${value.id})`;
			};

			const valueStr = channel
				? getValueStr(channel, emChannel)
				: role
				? getValueStr(role, emAt)
				: `${emEmptyFile}Not set`;

			const viewOptionEmbed = new MessageEmbed()
				.setAuthor(intr.user.tag, intr.member.displayAvatarURL())
				.setColor(intr.client.colors.try("YELLOW"))
				.addField(option, valueStr);

			intr.editReply({ embeds: [viewOptionEmbed] });

			intr.logger.log(
				`Used method VIEW on option ${option.toUpperCase()}:\n  ${(channel ?? role)?.id ?? "Not set"}`
			);
			break;
		}

		case "set": {
			const res = intr.options.getChannel("channel") ?? intr.options.getRole("role");

			const value = res?.id ?? "null";
			await config.set(value);

			const updatedValueStr = res ? `${emFileGreen}New value: ${res} (${res.id})` : `${emEmptyFile}Removed value`;

			const viewOptionEmbed = new MessageEmbed()
				.setAuthor(intr.user.tag, intr.member.displayAvatarURL())
				.setColor(intr.client.colors.try("INVIS"))
				.addField(option, updatedValueStr);

			intr.editReply({ embeds: [viewOptionEmbed] });

			intr.logger.log(`Used method SET on option ${option.toUpperCase()}:\n  ${value}`);
			break;
		}

		default: {
			break;
		}
	}
}
