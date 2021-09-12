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

	protected async upsertRow() {
		const exists = await this.existsRow();

		if (!exists) {
			await this.createRow();
		}
	}

	protected async still(): Promise<boolean> {
		if (!(await this.existsRow())) {
			return this.createRow();
		}

		return true;
	}

	protected async existsRow(): Promise<boolean> {
		this.checkProps();

		const query = `
            SELECT EXISTS
                (SELECT 1 FROM ${this.schema!}."${this.table!}" WHERE id=${this.guildId!})
        `;

		const res = await this.one<ExistsResult>(query);
		return res ? res.exists : false;
	}

	protected createRow() {
		this.checkProps();

		const query = `
            INSERT INTO ${this.schema!}."${this.table!}" (id)
            VALUES (${this.guildId!})
            ON CONFLICT DO NOTHING;
        `;

		return this.none(query);
	}

	protected updateRow(columns: string[], newValues: string[]): Promise<boolean> {
		this.checkProps();

		const data: string[] = [];
		for (let i = 0; i < columns.length; i++) {
			const key = columns[i];
			const value = newValues[i];
			data.push(`${key}=${value}`);
		}

		const query = `
            UPDATE ${this.schema}."${this.table!}"
            SET ${data.join(", ")}
            WHERE id=${this.guildId!}
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

	private checkProps(guild = true, schema = true, table = true) {
		if (guild && !this.guildId) throw new Error("Guild id must be set to the Creator");
		if (schema && !this.schema) throw new Error("Schema must be set to the Creator");
		if (table && !this.table) throw new Error("Table must be set to the Creator");
	}
}
