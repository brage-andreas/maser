import type { CreatorOptions } from "../src/postgres.js";
import type { Clint } from "../../extensions/";
import ConfigLogsManager from "./ConfigLogsManager.js";
import ConfigRoleManager from "./ConfigRoleManager.js";

export default class ConfigManager {
	memberLog: ConfigLogsManager;
	botLog: ConfigLogsManager;
	roles: ConfigRoleManager;

	constructor(client: Clint, guildId: string, options?: CreatorOptions) {
		this.memberLog = new ConfigLogsManager(client, options) //
			.setKey("member_log_channel_id")
			.setSchema("configs")
			.setGuild(guildId);

		this.botLog = new ConfigLogsManager(client, options) //
			.setKey("bot_log_channel_id")
			.setSchema("configs")
			.setGuild(guildId);

		this.roles = new ConfigRoleManager(client, options) //
			.setSchema("roles")
			.setGuild(guildId);
	}
}
