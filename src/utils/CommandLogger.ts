import type { Guild, TextBasedChannels, User } from "discord.js";
import type { CmdIntr } from "../Typings.js";
import { BaseLogger } from "./Logger.js";

export class CommandLogger extends BaseLogger {
	private _type = "COMMAND";

	constructor(intr: CmdIntr) {
		super();

		this.traceValues.setUser(intr.user);
		this.traceValues.setGuild(intr.guild);
		if (intr.channel && intr.channel.type !== "DM") {
			this.traceValues.setChannel(intr.channel);
		}
	}

	public log(...messages: string[]) {
		this.print(this._type, ...messages);
	}

	public setUser(user: User | null) {
		this.traceValues.setUser(user);
	}

	public setGuild(guild: Guild | null) {
		this.traceValues.setGuild(guild);
	}

	public setChannel(channel: TextBasedChannels | null) {
		if (!channel || channel.type !== "DM") {
			this.traceValues.setChannel(channel);
		}
	}
}
