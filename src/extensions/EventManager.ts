import type { Event } from "../Typings.js";
import type { Clint } from "./Clint.js";

import { readdirSync } from "fs";

const DIR = new URL("../events", import.meta.url);

export class EventManager {
	private _events: Map<string, Event>;
	private _client: Clint;

	constructor(client: Clint) {
		this._client = client;
		this._events = new Map();
	}

	public async init() {
		const eventNames = this._readDir();
		this._events = await this._getEvents(eventNames);
		this._setEvents();
	}

	private _readDir() {
		return readdirSync(DIR);
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
			this._client.on(name, (...args: unknown[]) => {
				event.execute(this._client, ...args);
			});
		});
	}
}
