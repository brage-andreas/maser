import type { Client } from "../../extensions/";
import ConfigLogsManager from "./ConfigLogsManager.js";

export default class ConfigManager {
	public memberLog: ConfigLogsManager;
	public botLog: ConfigLogsManager;

	constructor(client: Client, guildId: string) {
		this.memberLog = new ConfigLogsManager(client) //
			.setKey("member_log_channel_id")
			.setSchema("configs")
			.setGuild(guildId);

		this.botLog = new ConfigLogsManager(client) //
			.setKey("bot_log_channel_id")
			.setSchema("configs")
			.setGuild(guildId);
	}
}
