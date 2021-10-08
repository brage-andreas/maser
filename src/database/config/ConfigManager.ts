import type { Client } from "../../extensions/";
import ConfigLogsManager from "./ConfigLogsManager.js";
import Postgres from "../src/postgres.js";

export default class ConfigManager extends Postgres {
	public memberLog: ConfigLogsManager;
	public botLog: ConfigLogsManager;

	constructor(client: Client, guildId: string) {
		const options = { schema: "configs", guildResolvable: guildId };

		super(client, options);

		this.memberLog = new ConfigLogsManager(client, options) //
			.setKey("member_log_channel_id");

		this.botLog = new ConfigLogsManager(client, options) //
			.setKey("bot_log_channel_id");
	}
}
