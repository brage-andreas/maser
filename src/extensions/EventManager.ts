import type { Event } from "../Typings.js";
import type { Clint } from "./Clint";

import { readdirSync } from "fs";
import { EventLogger } from "../utils/Logger.js";

const EVENT_DIR = new URL("../events", import.meta.url);

export class EventManager {
	private _events: Map<string, Event>;
	public logger: EventLogger;
	public client: Clint;

	constructor(client: Clint) {
		this._events = new Map();
		this.logger = new EventLogger();
		this.client = client;
	}

	public async init() {
		const eventNames = this._readDir(EVENT_DIR);
		this._events = await this._getEvents(eventNames);
		this._setEvents();
	}

	private _readDir(dir: URL) {
		return readdirSync(dir);
	}

	private async _getEvents(files: string[]) {
		const hash: Map<string, Event> = new Map();
		for (let fileName of files) {
			const event = (await import(`../events/${fileName}`)) as Event;
			const name = fileName.split(".")[0];
			hash.set(name, event);
		}
		return hash;
	}

	private _setEvents() {
		this._events.forEach((event, name) => {
			this.client.on(name, (...args: unknown[]) => {
				event.execute(this.client, ...args);
			});
		});
	}
}
