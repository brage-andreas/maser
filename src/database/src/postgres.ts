import { type Client } from "discord.js";
import { REGEXP } from "../../constants/index.js";
import type { PostgresOptions, PostresExists } from "../../typings/database.js";
import PostgresConnection from "./connection.js";

export default abstract class Postgres extends PostgresConnection {
	public client: Client<true>;

	protected idValue: string;
	protected schema: string;
	protected idKey: string;
	protected table: string;

	public constructor(client: Client<true>, options: PostgresOptions) {
		super();

		if (!REGEXP.ID.test(options.idValue))
			throw new TypeError(`Provided argument for idValue is not a valid ID (reading: "${options.idValue}")"`);

		this.client = client;

		this.idValue = options.idValue;

		this.schema = options?.schema ?? null;

		this.table = options?.table ?? null;

		this.idKey = options.idKey;
	}

	protected async still(columns: string[], values: unknown[]): Promise<void> {
		if (!(await this.existsRow())) await this.createRow(columns, values);
	}

	protected async existsRow(): Promise<boolean> {
		const query = `
			SELECT EXISTS (
				SELECT 1
				FROM ${this.schema}."${this.table}"
				WHERE "${this.idKey}"=${this.idValue}
			)
		`;

		const res = await this.one<PostresExists>(query);

		return res ? res.exists : false;
	}

	protected async createRow(columns: string[], values: unknown[]): Promise<void> {
		const formattedColumns = columns.map((e) => `"${e}"`);

		const formattedValues = values.map((e) =>
			typeof e === "string" && e !== "NULL" ? `'${e}'` : `${e ?? "NULL"}`
		);

		const query = `
            INSERT INTO ${this.schema}."${this.table}" (\n${formattedColumns.join(", ")}\n)
            VALUES (\n${formattedValues.join(", ")}\n)
            ON CONFLICT DO NOTHING;
        `;

		return await this.none(query);
	}

	protected async updateRow(
		columns: string[],
		newValues: (boolean | number | string | null)[],
		whereQuery?: string
	): Promise<void> {
		const data = columns.map(
			(column, i) => `"${column}"=${newValues[i] === "NULL" ? "NULL" : `'${newValues[i]}'`}`
		);

		const query = `
			UPDATE ${this.schema}."${this.table}"
			SET ${data.join(",\n")}
			WHERE ${whereQuery ?? `"${this.idKey}"=${this.idValue}`}
        `;

		return await this.none(query);
	}

	protected async deleteRow(whereQuery: string): Promise<void> {
		const query = `
			DELETE FROM ${this.schema}."${this.table}"
			WHERE ${whereQuery};
        `;

		return await this.none(query);
	}
}
