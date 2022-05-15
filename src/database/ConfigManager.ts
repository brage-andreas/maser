import { type Client } from "discord.js";
import type {
	ConfigChannelTypes,
	ConfigData,
	ConfigTableColumns
} from "../typings/database.js";
import Postgres from "./src/postgres.js";

export default class ConfigManager extends Postgres {
	public key: ConfigTableColumns | null;

	public constructor(
		client: Client<true>,
		guildId: string,
		key?: ConfigTableColumns | null
	) {
		super(client, {
			schema: "guilds",
			table: "configs",
			idKey: "guildId",
			idValue: guildId
		});

		this.key = key ?? null;
	}

	public setKey(key: ConfigTableColumns): this {
		this.key = key;

		return this;
	}

	public async getChannel(): Promise<ConfigChannelTypes | null> {
		if (!this.idValue) {
			throw new Error("Guild id must be set to the ConfigManager");
		}

		if (!this.key) {
			throw new Error("Key must be set to the ConfigManager");
		}

		const id = await this.getAll().then(
			(result) => result?.[this.key!] ?? null
		);

		if (!id) {
			return null;
		}

		const guild = this.client.guilds.cache.get(this.idValue);

		if (!guild) {
			return null;
		}

		const channel = guild.channels.cache.get(id) as
			| ConfigChannelTypes
			| undefined;

		return channel ?? null;
	}

	/* public async getRole(): Promise<Role | null> {
		if (!this.idValue) throw new Error("Guild id must be set to the ConfigManager");
		if (!this.key) throw new Error("Key must be set to the ConfigManager");

		const id = await this.getAll().then((result) => {
			return result?.[this.key!] ?? null;
		});
		if (!id) return null;

		const guild = this.client.guilds.cache.get(this.idValue);
		if (!guild) return null;

		return guild.roles.cache.get(id) ?? null;
	}*/

	public async set(value: string, key?: ConfigTableColumns): Promise<void> {
		if (!key && !this.key) {
			throw new Error("Key must be set or provided to the ConfigManager");
		}

		await this.still([this.idKey], [this.idValue]);

		return this.updateRow([key ?? this.key!], [value]);
	}

	public async getAll(): Promise<ConfigData> {
		if (!this.idValue) {
			throw new Error("Guild id must be set to the ConfigManager");
		}

		await this.still([this.idKey], [this.idValue]);

		const query = `
            SELECT *
            FROM ${this.schema}."${this.table}"
            WHERE "guildId" = ${this.idValue}
        `;

		return this.one<ConfigData>(query);
	}

	public async getAllValues(): Promise<ConfigData> {
		if (!this.idValue) {
			throw new Error("Guild id must be set to the ConfigManager");
		}

		await this.still([this.idKey], [this.idValue]);

		const query = `
            SELECT *
            FROM ${this.schema}."${this.table}"
            WHERE "guildId" = ${this.idValue}
        `;

		const res = await this.one<ConfigData>(query);

		delete res.guildId;

		return res;
	}
}
