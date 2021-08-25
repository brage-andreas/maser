import type { CmdIntr } from "../Typings";

import Util from ".";
import { Clint } from "../extensions/Clint";

interface Cache {
	channelId?: string;
	channel?: string;
	guildId?: string;
	userId?: string;
	guild?: string;
	user?: string;
}

class CacheManager extends null {
	private _cache: Cache = this._emptyCache();

	public get() {
		return this._cache;
	}

	public set(newCache: Cache) {
		this._cache = newCache;
	}

	public clear() {
		this._cache = this._emptyCache();
	}

	private _emptyCache() {
		return {
			channelId: undefined,
			channel: undefined,
			guildId: undefined,
			userId: undefined,
			guild: undefined,
			user: undefined
		};
	}
}

class BaseLogger {
	protected cache: CacheManager;

	constructor() {
		this.cache = new CacheManager();
	}

	protected print(...messages: string[]) {
		messages.forEach((message) => void process.stdout.write(message));
	}

	protected parse(...messages: string[]) {
		if (!messages.length) return null;

		messages = messages.map((message) => Util.Parse(message) as string);
		if (messages.length === 1) return messages[0];
		else return messages;
	}
}

export class CommandLogger extends BaseLogger {
	constructor(interaction: CmdIntr) {
		super();
	}

	public log(...messages: string[]) {
		//
	}
}

export class EventLogger extends BaseLogger {
	constructor(client: Clint) {
		super();
	}

    public log(...messages: string[]) {
		//
	}
}
