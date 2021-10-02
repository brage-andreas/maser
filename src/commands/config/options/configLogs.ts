import type { AllowedConfigTextChannels, ConfigCommandData } from "../../../typings.js";
import type ConfigLogsManager from "../../../database/config/ConfigLogsManager.js";

export default async function configLogs(data: ConfigCommandData) {
	const { config, intr, method, option } = data;

	let base: ConfigLogsManager | null = null;

	if (option === "bot-log") base = config.botLog;
	else if (option === "member-log") base = config.memberLog;

	if (!base) return intr.editReply("Something went wrong. How did you manage this?");

	switch (method) {
		case "view": {
			const channel = await base.get<AllowedConfigTextChannels>();
			intr.editReply(channel?.toString() ?? "Not set");

			intr.logger.log(`Used method VIEW on option ${option.toUpperCase()}:\n  ${channel?.id ?? "Not set"}`);
			break;
		}

		case "set": {
			const channel = intr.options.getChannel("channel");

			const value = channel?.id ?? "null";

			const res = await base.set(value);
			intr.editReply(`${res}`);

			intr.logger.log(`Used method SET on option ${option.toUpperCase()}:\n  ${value}`);
			break;
		}
	}
}
