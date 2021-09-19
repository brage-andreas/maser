import type { ConfigCommandData } from "../../../typings.js";
import type ConfigLogsManager from "../../../database/config/ConfigLogsManager.js";
import type { TextChannel } from "discord.js";

export default async function configLogs(data: ConfigCommandData) {
	const { config, intr, method, option } = data;

	let base: ConfigLogsManager | null = null;
	if (option === "bot-log") base = config.botLog;
	else if (option === "member-log") base = config.memberLog;

	if (!base) return;

	switch (method) {
		case "view": {
			const channel = await config.botLog.get<TextChannel>();
			intr.editReply(channel?.toString() ?? "Not set");

			intr.logger.log(`Used method VIEW on option ${option.toUpperCase()}:\n  ${channel?.id ?? "Not set"}`);
			break;
		}

		case "set": {
			const channel = intr.options.getChannel("new-channel");

			if (channel && channel.type !== "GUILD_TEXT") {
				intr.editReply("The channel needs to be a text-channel.");
				break;
			}

			const value = channel?.id ?? "null";

			const res = await base.set(value);
			intr.editReply(`${res}`);

			intr.logger.log(`Used method SET on option ${option.toUpperCase()}:\n  ${value}`);
			break;
		}
	}
}
