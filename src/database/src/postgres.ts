import type { Guild } from "discord.js";
import type { Clint } from "../../extensions/Clint.js";
import { ExistsResult } from "../../typings.js";
import PostgresConnection from "./connection.js";

export interface CreatorOptions {
	guildResolvable?: Guild | string | null;
	schema?: string | null;
	table?: string | null;
}

export default abstract class Postgres extends PostgresConnection {
	protected guildId: string | null;
	protected schema: string | null;
	protected table: string | null;

	constructor(client: Clint, options?: CreatorOptions) {
		super(client);

		this.guildId = this.resolveGuild(options?.guildResolvable);
		this.schema = options?.schema ?? null;
		this.table = options?.table ?? null;
	}

	public setGuild(guildResolvable: Guild | string | undefined | null): this {
		this.guildId = this.resolveGuild(guildResolvable);
		return this;
	}

	public setSchema(schema: string | undefined | null): this {
		this.schema = schema ?? null;
		return this;
	}

	public setTable(table: string | undefined | null): this {
		this.table = table ?? null;
		return this;
	}

	protected async upsertRow(table: string) {
		if (!this.guildId) throw new Error("Guild id must be set to the Creator");
		if (!this.schema) throw new Error("Schema must be set to the Creator");

		const exists = await this.existsRow(table);
		if (!exists) {
			await this.createRow(table);
		}
	}

	protected async existsRow(table: string) {
		if (!this.guildId) throw new Error("Guild id must be set to the Creator");
		if (!this.schema) throw new Error("Schema must be set to the Creator");

		const query = `
            SELECT EXISTS
                (SELECT 1 FROM ${this.schema}."${table}" WHERE id=${this.guildId})
        `;

		const res = await this.one<ExistsResult>(query);
		return res ? res.exists : res;
	}

	protected createRow(table: string) {
		if (!this.guildId) throw new Error("Guild id must be set to the Creator");
		if (!this.schema) throw new Error("Schema must be set to the Creator");

		const query = `
            INSERT INTO ${this.schema}."${table}" (id)
            VALUES (${this.guildId})
            ON CONFLICT DO NOTHING;
        `;

		return this.none(query);
	}

	protected updateRow(table: string, columns: string[], newValues: string[]): Promise<boolean> {
		if (!this.guildId) throw new Error("Guild id must be set to the Creator");
		if (!this.schema) throw new Error("Schema must be set to the Creator");

		const data: string[] = [];
		for (let i = 0; i < columns.length; i++) {
			const key = columns[i];
			const value = newValues[i];
			data.push(`${key}=${value}`);
		}

		const query = `
            UPDATE ${this.schema}."${table}"
            SET ${data.join(", ")}
            WHERE id=${this.guildId}
        `;

		return this.none(query);
	}

	protected resolveGuild(guildResolvable: Guild | string | undefined | null): string | null {
		if (!guildResolvable) return null;

		if (typeof guildResolvable === "string") return guildResolvable;
		else return guildResolvable.id;
	}

	protected resolveOptions(options: CreatorOptions | undefined) {
		const { schema, guildResolvable } = options ?? {};

		if (schema !== undefined) this.schema = schema;
		if (guildResolvable !== undefined) this.guildId = this.resolveGuild(guildResolvable);
	}
}
