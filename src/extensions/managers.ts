import type { Event, CmdIntr, Command } from "../Typings.js";
import type { Clint } from "./Clint.js";

import { readdirSync } from "fs";
import { COLORS, ID_REGEX } from "../Constants.js";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import Util from "../utils/index.js";

const BASE_EVENT_DIR = new URL("../events", import.meta.url);
const BASE_CMD_DIR = new URL("../commands", import.meta.url);

export class EventManager {
	private _events: Map<string, Event>;
	public client: Clint;

	constructor(client: Clint) {
		this.client = client;
		this._events = new Map();
	}

	public async init() {
		const eventNames = this._readDir(BASE_EVENT_DIR);
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

export class EmojiManager {
	public client: Clint;

	constructor(client: Clint) {
		this.client = client;
	}

	public findAll(...emojis: string[]) {
		const emojiArray: string[] = [];

		emojis.forEach((emojiName) => {
			const emoji = this._get(emojiName);
			if (emoji) emojiArray.push(emoji);
		});

		if (emojiArray.length === 0) return null;
		else if (emojiArray.length === 1) return emojiArray[0];
		else return emojiArray;
	}

	public find(emojiName: string) {
		return this._get(emojiName);
	}

	private _get(emojiName: string) {
		const emojis = this.client.emojis.cache;
		const emoji = emojis.find((emoji) => emoji.name?.startsWith(emojiName.toLowerCase()) ?? false);

		return emoji?.toString() ?? null;
	}
}

export class CommandManager {
	private _commands: Map<string, Command>;

	constructor() {
		this._commands = new Map();
	}

	public async init() {
		const folders = this._readDir(BASE_CMD_DIR);
		this._commands = await this._getCommands(folders);
	}

	public async execute(intr: CmdIntr) {
		this._commands.get(intr.commandName)?.execute(intr);
	}

	public async put(clientId: string, guildId?: string) {
		this._put(clientId, guildId);
	}

	public async clear(clientId: string, guildId?: string) {
		this._put(clientId, guildId, true);
	}

	private _readDir(dir: URL) {
		return readdirSync(dir);
	}

	private async _getCommands(folders: string[]) {
		const hash: Map<string, Command> = new Map();
		for (let folder of folders) {
			const FOLDER_DIR = new URL(`../commands/${folder}`, import.meta.url);

			const files = this._readDir(FOLDER_DIR);
			for (let fileName of files) {
				const command = (await import(`../commands/${folder}/${fileName}`)) as Command;
				const name = fileName.split(".")[0];
				hash.set(name, command);
			}
		}
		return hash;
	}

	private _getData() {
		return [...this._commands.values()].map((cmd) => cmd.data);
	}

	private async _put(clientId: string, guildId?: string, clear = false) {
		if (!process.env.TOKEN) {
			return Util.Log("Token not defined in .env file");
		}

		if (!ID_REGEX.test(clientId)) {
			return Util.Log(`Client id is faulty: ${clientId}`);
		}

		if (guildId && !ID_REGEX.test(guildId)) {
			return Util.Log(`Guild id is faulty: ${clientId}`);
		}

		clientId = clientId as `${bigint}`;
		guildId = guildId as `${bigint}` | undefined;

		const data = this._getData();
		const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

		try {
			const route = guildId
				? Routes.applicationGuildCommands(clientId, guildId)
				: Routes.applicationCommands(clientId);

			const options = { body: clear ? [] : data };

			const res = await rest
				.put(route, options)
				.then(() => `${clear ? "Cleared" : "Set"} commands in guild: ${guildId}`);

			Util.Log(res);
		} catch (e) {
			Util.Log(e.stack ?? e.message ?? e.toString());
		}
	}
}

export class ColorManager {
	static HEX_REGEX = /^#[a-f0-9]{6}$/i;
	public colors: Map<string, `#${string}`>;

	constructor() {
		this.colors = this._get();
	}

	public get(query: string) {
		return this.colors.get(query);
	}

	public try(query: string) {
		return this.colors.get(query) ?? "#000000";
	}

	public toArray() {
		const colorArray: `#${string}`[] = [];
		for (const [, color] of this.colors) {
			colorArray.push(color);
		}
		return colorArray;
	}

	public isValid(color: string) {
		color = color.trim().replace("#", "");
		return ColorManager.HEX_REGEX.test(`#${color}`);
	}

	private _get() {
		const colorMap: Map<string, `#${string}`> = new Map();
		for (const [name, color] of Object.entries(COLORS)) {
			if (!this.isValid(color)) throw new TypeError(`Supplied color is not valid hex color: ${color}`);
			colorMap.set(name.toUpperCase(), `#${color}`);
		}
		return colorMap;
	}
}
