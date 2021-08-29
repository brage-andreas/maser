import type { Guild } from "discord.js";
import { BaseLogger } from "./Logger.js";

export class EventLogger extends BaseLogger {
	private _type = "EVENT";

	constructor(guild?: Guild) {
		super();

		if (guild) this.traceValues.setGuild(guild);
	}

	public log(...messages: string[]) {
		this.print(this._type, ...messages);
	}

	public setGuild(guild: Guild | null) {
		this.traceValues.setGuild(guild);
		return this;
	}
}
