import type { AllowedConfigTextChannels, ConfigColumns, ConfigResult, ConfigTables } from "../../../typings.js";
import type { Client } from "../../../extensions";
import Postgres from "../postgres.js";
import { Role } from "discord.js";

export default class ConfigManager extends Postgres {
	public table: ConfigTables | null;
	public key: ConfigColumns | null;

	constructor(client: Client, guildId: string, table?: ConfigTables, key?: ConfigColumns | null) {
		const options = { schema: "configs", table: table ?? null, guildResolvable: guildId };
		super(client, options);

		this.table = table ?? null;
		this.key = key ?? null;
	}

	public setKey(key: ConfigColumns): this {
		this.key = key;
		return this;
	}

	public setTable(key: ConfigTables): this {
		this.table = key;
		return this;
	}

	public async getChannel(): Promise<AllowedConfigTextChannels | null> {
		if (!this.guildId) throw new Error("Guild id must be set to the ConfigManager");
		if (!this.key) throw new Error("Key must be set to the ConfigManager");

		const id = await this.getAll().then((result) => {
			return result?.[this.key!] ?? null;
		});
		if (!id) return null;

		const guild = this.client.guilds.cache.get(this.guildId);
		if (!guild) return null;

		const channel = guild.channels.cache.get(id) as AllowedConfigTextChannels | undefined;
		return channel ?? null;
	}

	public async getRole(): Promise<Role | null> {
		if (!this.guildId) throw new Error("Guild id must be set to the ConfigManager");
		if (!this.key) throw new Error("Key must be set to the ConfigManager");

		const id = await this.getAll().then((result) => {
			return result?.[this.key!] ?? null;
		});
		if (!id) return null;

		const guild = this.client.guilds.cache.get(this.guildId);
		if (!guild) return null;

		return guild.roles.cache.get(id) ?? null;
	}

	public async set(value: string, key?: ConfigColumns): Promise<void> {
		if (!key && !this.key) throw new Error("Key must be set or provided to the ConfigManager");

		await this.still();

		return this.updateRow([key ?? this.key!], [value]);
	}

	public async getAll(): Promise<ConfigResult> {
		if (!this.guildId) throw new Error("Guild id must be set to the ConfigManager");
		await this.still();

		const query = `
            SELECT *
            FROM configs.logs
            WHERE id = ${this.guildId}
        `;

		return this.one<ConfigResult>(query);
	}
}
