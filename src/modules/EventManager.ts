import type { Client } from "discord.js";
import { readdirSync } from "fs";
import { EventLogger } from "../loggers/index.js";
import type { Event } from "../typings/index.js";

const EVENT_DIR = new URL("../events", import.meta.url);
type EventMap = Map<string, Event>;

/**
 * Manages events for the client.
 */
export default class EventManager {
	public client: Client<true>;
	public logger: EventLogger;
	private events: EventMap;

	/**
	 * Creates an event manager.
	 * @param client The client to use in the events.
	 */
	public constructor(client: Client<true>) {
		this.events = new Map();
		this.logger = new EventLogger(client);

		this.client = client;
	}

	/**
	 * Readies the events by loading them internally.
	 */
	public async readyEvents(): Promise<void> {
		this.events = await this.getEvents();

		this.setEvents();
	}

	/**
	 * Returns a map of all events from their provided names.
	 */
	private async getEvents() {
		const map: EventMap = new Map();

		for (const fileName of readdirSync(EVENT_DIR)) {
			const event = (await import(`../events/${fileName}`)) as Event;
			const name = fileName.split(".")[0];

			map.set(name, event);
		}

		return map;
	}

	/**
	 * Returns a map of all events from their provided names.
	 */
	private setEvents() {
		this.events.forEach((event, name) => {
			this.client.on(name, (...args: Array<unknown>) => {
				event.execute(this.client, ...args);
			});
		});
	}
}
