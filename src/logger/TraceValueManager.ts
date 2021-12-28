import type { Guild, GuildTextBasedChannel, User } from "discord.js";

interface Cache {
	channel: string | null;
	userId: string | null;
	guild: string | null;
	user: string | null;
}

export default class TraceValueManager {
	private _cache: Cache = this._emptyCache();

	public get() {
		return this._cache;
	}

	public set(newCache: Cache) {
		this._cache = newCache;
	}

	public has(key: "CHANNEL" | "GUILD" | "USER") {
		if (key === "CHANNEL") return Boolean(this._cache.channel);

		if (key === "GUILD") return Boolean(this._cache.guild);

		if (key === "USER") return Boolean(this._cache.userId);

		return false;
	}

	public any() {
		return Boolean(this._cache.channel) || Boolean(this._cache.guild) || Boolean(this._cache.userId);
	}

	public setChannel(channel: GuildTextBasedChannel | null) {
		this._cache.channel = channel?.name ?? null;
	}

	public setGuild(guild: Guild | null) {
		this._cache.guild = guild?.name ?? null;
	}

	public setUser(user: User | null) {
		this._cache.userId = user?.id ?? null;

		this._cache.user = user?.tag ?? null;
	}

	public clear() {
		this._cache = this._emptyCache();
	}

	private _emptyCache() {
		return {
			channel: null,
			userId: null,
			guild: null,
			user: null
		} as Cache;
	}
}
