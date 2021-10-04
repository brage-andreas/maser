import type { CreatorOptions } from "../src/postgres.js";
import type { Client } from "../../extensions/";
import ConfigLogsManager from "./ConfigLogsManager.js";

export default class ConfigManager {
	memberLog: ConfigLogsManager;
	botLog: ConfigLogsManager;

	constructor(client: Client, guildId: string, options?: CreatorOptions) {
		this.memberLog = new ConfigLogsManager(client, options) //
			.setKey("member_log_channel_id")
			.setSchema("configs")
			.setGuild(guildId);

		this.botLog = new ConfigLogsManager(client, options) //
			.setKey("bot_log_channel_id")
			.setSchema("configs")
			.setGuild(guildId);
	}
}
