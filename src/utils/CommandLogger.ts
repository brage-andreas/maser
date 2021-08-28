import type { Guild, TextBasedChannels, User } from "discord.js";
import type { CmdIntr } from "../Typings.js";
import { BaseLogger } from "./Logger.js";

export class CommandLogger extends BaseLogger {
	private _type = "COMMAND";

	constructor(intr: CmdIntr) {
		super();

		this.cache.setUser(intr.user);
		this.cache.setGuild(intr.guild);
		if (intr.channel && intr.channel.type !== "DM") {
			this.cache.setChannel(intr.channel);
		}
	}

	public log(...messages: string[]) {
		this.print(this._type, ...messages);
	}

	public setUser(user: User | null) {
		this.cache.setUser(user);
	}

	public setGuild(guild: Guild | null) {
		this.cache.setGuild(guild);
	}

	public setChannel(channel: TextBasedChannels | null) {
		if (!channel || channel.type !== "DM") {
			this.cache.setChannel(channel);
		}
	}
}
