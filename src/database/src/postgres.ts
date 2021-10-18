import type { ExistsResult, PostgresOptions } from "../../typings.js";
import type { Client } from "../../extensions/";
import type { Guild } from "discord.js";
import PostgresConnection from "./connection.js";
import { REGEX } from "../../constants.js";

export default abstract class Postgres extends PostgresConnection {
	protected guildId: string | null;
	protected schema: string | null;
	protected table: string | null;

	constructor(client: Client, options?: PostgresOptions) {
		super(client);

		this.guildId = this.resolveGuild(options?.guildResolvable);
		if (this.guildId && !REGEX.ID.test(this.guildId)) {
			throw new TypeError(`Guild resolvable must be a valid id: ${this.guildId}`);
		}

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

	protected async still(): Promise<void> {
		const exists = await this.existsRow();

		if (!exists) {
			await this.createRow();
		}
	}

	protected async existsRow(): Promise<boolean> {
		this.checkProps();

		const query = `
            SELECT EXISTS (
                SELECT 1
                FROM ${this.schema!}."${this.table!}"
                WHERE id=${this.guildId!}
            )
        `;

		const res = await this.one<ExistsResult>(query);
		return res ? res.exists : false;
	}

	protected createRow(): Promise<void> {
		this.checkProps();

		const query = `
            INSERT INTO ${this.schema!}."${this.table!}" (id)
            VALUES (${this.guildId!})
            ON CONFLICT DO NOTHING;
        `;

		return this.none(query);
	}

	protected updateRow(columns: string[], newValues: string[]): Promise<void> {
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

	protected resolveOptions(options: PostgresOptions | undefined): void {
		const { guildResolvable, schema, table } = options ?? {};

		if (guildResolvable !== undefined) this.guildId = this.resolveGuild(guildResolvable);
		if (schema !== undefined) this.schema = schema;
		if (table !== undefined) this.table = table;
	}

	private checkProps(options?: { schema: boolean; guild: boolean; table: boolean }): void {
		const defaultOptions = { schema: true, guild: true, table: true };
		const { schema, guild, table } = options ?? defaultOptions;

		if (schema && !this.schema) throw new Error("Schema must be set");
		if (guild && !this.guildId) throw new Error("Guild id must be set");
		if (table && !this.table) throw new Error("Table must be set");
	}
}
