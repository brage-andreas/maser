import type { AllowedConfigTextChannels, ConfigColumns, ConfigResult } from "../typings.js";
import type { Client } from "../modules/index.js";
import Postgres from "./src/postgres.js";
import { Role } from "discord.js";

export default class ConfigManager extends Postgres {
	public key: ConfigColumns | null;

	constructor(client: Client, guildId: string, key?: ConfigColumns | null) {
		super(client, { schema: "guilds", table: "configs", idKey: "guildId", id: guildId });

		this.key = key ?? null;
	}

	public setKey(key: ConfigColumns): this {
		this.key = key;
		return this;
	}

	public async getChannel(): Promise<AllowedConfigTextChannels | null> {
		if (!this.idValue) throw new Error("Guild id must be set to the ConfigManager");
		if (!this.key) throw new Error("Key must be set to the ConfigManager");

		const id = await this.getAll().then((result) => {
			return result?.[this.key!] ?? null;
		});
		if (!id) return null;

		const guild = this.client.guilds.cache.get(this.idValue);
		if (!guild) return null;

		const channel = guild.channels.cache.get(id) as AllowedConfigTextChannels | undefined;
		return channel ?? null;
	}

	public async getRole(): Promise<Role | null> {
		if (!this.idValue) throw new Error("Guild id must be set to the ConfigManager");
		if (!this.key) throw new Error("Key must be set to the ConfigManager");

		const id = await this.getAll().then((result) => {
			return result?.[this.key!] ?? null;
		});
		if (!id) return null;

		const guild = this.client.guilds.cache.get(this.idValue);
		if (!guild) return null;

		return guild.roles.cache.get(id) ?? null;
	}

	public async set(value: string, key?: ConfigColumns): Promise<void> {
		if (!key && !this.key) throw new Error("Key must be set or provided to the ConfigManager");

		await this.still([this.idKey], [this.idValue]);

		return this.updateRow([key ?? this.key!], [value]);
	}

	public async getAll(): Promise<ConfigResult> {
		if (!this.idValue) throw new Error("Guild id must be set to the ConfigManager");
		await this.still([this.idKey], [this.idValue]);

		const query = `
            SELECT *
            FROM ${this.schema}."${this.table}"
            WHERE "guildId" = ${this.idValue}
        `;

		return this.one<ConfigResult>(query);
	}
}
