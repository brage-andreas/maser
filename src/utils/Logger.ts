import type { Guild, GuildChannel, User } from "discord.js";
import Util from "./index.js";

interface Cache {
	channel?: string;
	userId?: string;
	guild?: string;
	user?: string;
}

class CacheManager {
	private _cache: Cache = this._emptyCache();

	public get() {
		return this._cache;
	}

	public set(newCache: Cache) {
		this._cache = newCache;
	}

	public has(key: "USER" | "GUILD" | "CHANNEL") {
		if (key === "CHANNEL") return !!this._cache.channel;
		if (key === "GUILD") return !!this._cache.guild;
		if (key === "USER") return !!this._cache.userId;
		return false;
	}

	public setChannel(channel: GuildChannel) {
		this._cache.channel = channel.name;
	}

	public setGuild(guild: Guild) {
		this._cache.guild = guild.name;
	}

	public setUser(user: User) {
		this._cache.userId = user.id;
		this._cache.user = user.tag;
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

export class BaseLogger {
	protected cache: CacheManager;

	constructor() {
		this.cache = new CacheManager();
	}

	protected print(type: string, ...messages: string[]) {
		const base = this._addBase(type);
		const trace = this._addTrace();

		process.stdout.write(base);
		if (trace) process.stdout.write(" > " + trace);
		process.stdout.write("\n");

		this.parse(...messages)?.forEach((message) => void console.log(message));
	}

	protected parse(...messages: string[]) {
		if (!messages.length) return null;
		return messages.map((message) => Util.Parse(message, 4) as string);
	}

	private _addBase(type: string /* | "INFO" */) {
		return `  [${type}] ${Util.Now()}`;
	}

	private _addTrace() {
		const cache = this.cache.get();
		let trace = [];

		if (this.cache.has("USER")) {
			trace.push(cache.user ? `${cache.user} (u: ${cache.userId})` : `u: ${cache.userId}`);
		}

		if (this.cache.has("CHANNEL")) {
			trace.push(`in #${cache.channel}`);
		}

		if (this.cache.has("GUILD")) {
			trace.push(`in ${cache.guild}`);
		}

		return trace.join(" ");
	}
}
