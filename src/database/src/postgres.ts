import type { ExistsResult, PostgresOptions } from "../../typings.js";
import type { Client } from "../../modules/index.js";

import PostgresConnection from "./connection.js";
import { REGEX } from "../../constants.js";

export default abstract class Postgres extends PostgresConnection {
	protected idKey: string;
	protected id: string;
	protected schema: string;
	protected table: string;

	constructor(client: Client, options: PostgresOptions) {
		super(client);

		if (!REGEX.ID.test(options.id))
			throw new TypeError(`Provided id is not a valid id (reading: "${options.id}")"`);

		this.id = options.id;
		this.schema = options?.schema ?? null;
		this.table = options?.table ?? null;
		this.idKey = options.idKey;
	}

	protected async still(columns: string[], values: any[]): Promise<void> {
		if (!(await this.existsRow())) {
			await this.createRow(columns, values);
		}
	}

	protected async existsRow(): Promise<boolean> {
		const query = `
			SELECT EXISTS (
				SELECT 1
				FROM ${this.schema}."${this.table}"
				WHERE "${this.idKey}"=${this.id}
			)
		`;

		const res = await this.one<ExistsResult>(query);
		return res ? res.exists : false;
	}

	protected createRow(columns: string[], values: any[]): Promise<void> {
		columns = columns.map((e) => `"${e}"`);
		values = values.map((e) => (typeof e === "string" ? `'${e}'` : `${e ?? "NULL"}`));

		const query = `
            INSERT INTO ${this.schema}."${this.table}" (\n${columns.join(", ")}\n)
            VALUES (\n${values.join(", ")}\n)
            ON CONFLICT DO NOTHING;
        `;

		return this.none(query);
	}

	protected async updateRow(columns: string[], newValues: string[], whereQuery?: string): Promise<void> {
		const data = columns.map(
			(column, i) => `"${column}"=${newValues[i] === "NULL" ? "NULL" : `'${newValues[i]}'`}`
		);

		const query = `
			UPDATE ${this.schema}."${this.table}"
			SET ${data.join(",\n")}
			WHERE ${whereQuery ?? `"${this.idKey}"=${this.id}`}
        `;

		return this.none(query);
	}
}
