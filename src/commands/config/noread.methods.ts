import { CONFIG_RESULT_KEYS } from "../../constants.js";
import { ConfigColumns, type ConfigCommandData } from "../../typings/index.js";

export default async function logs(data: ConfigCommandData) {
	const { config, intr, method, option } = data;

	const { emFileGreen } = intr.client.systemEmojis;

	switch (method) {
		case "view": {
			const channel = await config.getChannel();
			const role = await config.getRole();

			let response = `${emFileGreen} Config for **${intr.guild.name}** (${intr.guildId})\n\n• **${option}**: `;

			if (channel) response += channel.toString();
			else if (role) response += role.toString();
			else response += "Not set";

			intr.editReply(response);

			intr.logger.log(`Used method VIEW on option ${option.value}: ${(channel ?? role)?.id ?? "Not set"}`);
			break;
		}

		case "set": {
			const res = intr.options.getChannel("channel") ?? intr.options.getRole("role");

			const old = await config.getAllValues();

			const value = res?.id ?? "NULL";
			await config.set(value);

			old[option.value] = res?.id;

			let response = `${emFileGreen} Updated config for **${intr.guild.name}** (${intr.guildId})\n`;

			for (let [key, value] of Object.entries(old)) {
				const keyStr = CONFIG_RESULT_KEYS[key as ConfigColumns];

				const channel = intr.guild.channels.cache.get(value)?.toString() ?? null;
				const guild = intr.client.guilds.cache.get(value)?.name ?? null;
				const role = intr.guild.roles.cache.get(value)?.toString() ?? null;

				const mention = channel ?? guild ?? role;

				if (key === option.value) {
					let valueString = `\n• **${keyStr}**: `;

					if (mention && res) {
						valueString += `${mention} (${res.id}) **(updated)**`;
					} else if (res) {
						valueString += `Couldn't find anything with ID: ${value} **(updated)**`;
					} else {
						valueString += "Not set **(updated)**";
					}

					response += valueString;
				} else {
					const valueString = mention ? `${mention} (${value})` : `Couldn't find anything with ID: ${value}`;
					response += `\n• **${keyStr}**: ${value ? valueString : "Not set"}`;
				}
			}

			intr.editReply(response);

			intr.logger.log(`Used method SET on option ${option.value}: ${value}`);
			break;
		}
	}
}
