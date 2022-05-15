import type { Client } from "discord.js";
import { readdirSync } from "fs";
import { EventLogger } from "../logger/index.js";
import type { Event } from "../typings/index.js";

const EVENT_DIR = new URL("../events", import.meta.url);

/**
 * Manages events for the client.
 */
export default class EventManager {
	public logger: EventLogger;
	public client: Client<true>;
	private _events: Map<string, Event>;

	/**
	 * Creates an event manager.
	 */
	public constructor(client: Client<true>) {
		this._events = new Map<string, Event>();

		this.logger = new EventLogger(client);

		this.client = client;
	}

	/**
	 * Initialises the class by loading and setting events internally.
	 */
	public async init(): Promise<void> {
		const eventNames = this._readDir(EVENT_DIR);

		this._events = await this._getEvents(eventNames);

		this._setEvents();
	}

	/**
	 * Reads and returns a directory for files with a given URL.
	 */
	private _readDir(dir: URL): Array<string> {
		return readdirSync(dir);
	}

	/**
	 * Returns a map of all events from their provided names.
	 */
	private async _getEvents(files: Array<string>) {
		const hash: Map<string, Event> = new Map();

		for (const fileName of files) {
			const event = (await import(`../events/${fileName}`)) as Event;
			const name = fileName.split(".")[0];

			hash.set(name, event);
		}

		return hash;
	}

	/**
	 * Returns a map of all events from their provided names.
	 */
	private _setEvents() {
		this._events.forEach((event, name) => {
			this.client.on(name, (...args: Array<unknown>) => {
				event.execute(this.client, ...args);
			});
		});
	}
}
