import type { CmdIntr } from "../Typings.js";
import { BaseLogger } from "./Logger.js";

export class CommandLogger extends BaseLogger {
	private _type = "COMMAND";

	constructor(intr: CmdIntr) {
		super();

		this.cache.setUser(intr.user);
		this.cache.setGuild(intr.guild);
		if (intr.channel && intr.channel.type === "GUILD_TEXT") this.cache.setChannel(intr.channel);
	}

	public log(...messages: string[]) {
		this.print(this._type, ...messages);
	}
}
