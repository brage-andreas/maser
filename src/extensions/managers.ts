import type { Event, CmdIntr, Command } from "../Typings.js";
import type { GuildEmoji } from "discord.js";
import type { Clint } from "./Clint.js";

import { readdirSync } from "fs";
import { ID_REGEX } from "../Constants.js";
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
		const emojiArray: GuildEmoji[] = [];

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
		return this.client.emojis.cache.find((emoji) => emoji.name?.includes(emojiName.toLowerCase()) ?? false) ?? null;
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
