import type { Role, TextChannel } from "discord.js";
import type { Clint } from "../../extensions/";
import { ConfigColumns, ConfigResult } from "../../typings.js";
import Postgres, { CreatorOptions } from "../src/postgres.js";

export default class ConfigLogsManager extends Postgres {
	public key: ConfigColumns | null;

	constructor(client: Clint, options?: CreatorOptions) {
		super(client, options);
		this.setTable("logs");
		this.key = null;
	}

	public setKey(key: ConfigColumns) {
		this.key = key;
		return this;
	}

	public async get<T extends TextChannel | Role>(): Promise<T | null> {
		if (!this.key) throw new Error("Key must be set to the ConfigLogsManager");
		const channel = await this.getChannel(this.key);
		const role = await this.getRole(this.key);

		if (channel) return channel as T;
		if (role) return role as T;
		return null;
	}

	public async set(value: string, key?: ConfigColumns): Promise<boolean> {
		if (!key && !this.key) throw new Error("Key must be set to the ConfigLogsManager");

		await this.still();

		return this.updateRow([key ?? this.key!], [value]);
	}

	public async getAll(): Promise<ConfigResult | null> {
		if (!this.guildId) throw new Error("Guild id must be set to the ConfigLogsManager");
		await this.still();

		const query = `
            SELECT *
            FROM configs.logs
            WHERE id = ${this.guildId}
        `;

		const res = await this.one<ConfigResult>(query);
		return res;
	}

	private async getChannel(key: ConfigColumns): Promise<TextChannel | null> {
		const channelId = await this.getAll().then((result) => result?.[key] ?? null);
		if (!channelId) return null;

		const guild = this.client.guilds.cache.get(this.guildId!);
		const channel = guild?.channels.cache.get(channelId);
		if (!channel || channel.type !== "GUILD_TEXT") return null;

		return channel as TextChannel;
	}

	private async getRole(key: ConfigColumns): Promise<Role | null> {
		const roleId = await this.getAll().then((result) => result?.[key] ?? null);
		if (!roleId) return null;

		const guild = this.client.guilds.cache.get(this.guildId!);
		const role = guild?.roles.cache.get(roleId);
		if (!role) return null;

		return role as Role;
	}
}
