import type { Guild } from "discord.js";
import { BaseLogger } from "./BaseLogger.js";

export class EventLogger extends BaseLogger {
	event: string | null;

	constructor(guild?: Guild) {
		super();

		this.event = null;

		if (guild) this.traceValues.setGuild(guild);
	}

	public log(...messages: string[]) {
		this.print("EVENT", this.event ?? "EVENT", ...messages);
	}

	public setEvent(event: string | null) {
		this.event = event;
		return this;
	}

	public setGuild(guild: Guild | null) {
		this.traceValues.setGuild(guild);
		return this;
	}
}
