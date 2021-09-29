import type { Role } from "discord.js";
import type { Clint } from "../../extensions/";
import { AllowedConfigTextChannels, ConfigColumns, ConfigResult } from "../../typings.js";
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

	public async get<T extends AllowedConfigTextChannels | Role>(): Promise<T | null> {
		if (!this.key) throw new Error("Key must be set to the ConfigLogsManager");

		const channel = await this.getChannel();
		const role = await this.getRole();

		if (channel) return channel as T;
		if (role) return role as T;
		return null;
	}

	public async set(value: string, key?: ConfigColumns): Promise<boolean> {
		if (!key && !this.key) throw new Error("Key must be set or provided to the ConfigLogsManager");

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

	private async getChannel(): Promise<AllowedConfigTextChannels | null> {
		const channelId = await this.getAll().then((result) => {
			return result?.[this.key!] ?? null;
		});
		if (!channelId) return null;

		const guild = this.client.guilds.cache.get(this.guildId!);
		const channel = guild?.channels.cache.get(channelId) as AllowedConfigTextChannels | undefined;

		return channel ?? null;
	}

	private async getRole(): Promise<Role | null> {
		const roleId = await this.getAll().then((result) => result?.[this.key!] ?? null);
		if (!roleId) return null;

		const guild = this.client.guilds.cache.get(this.guildId!);
		const role = guild?.roles.cache.get(roleId);
		if (!role) return null;

		return role as Role;
	}
}
