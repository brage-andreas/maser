import type { Client } from "../../extensions/";
import postgres from "pg-promise";

const connectionString = "postgres://postgres:admin@localhost:5432/maser";
const connection = postgres()(connectionString);

export default class PostgresConnection {
	public client: Client;
	public connection = connection;

	constructor(client: Client) {
		this.client = client;
	}

	public async one<T>(query: string): Promise<T | null> {
		return this.connection.one<T>(query);
	}

	public async none(query: string): Promise<boolean> {
		return await this.connection
			.none(query)
			.then(() => true)
			.catch(() => false);
	}

	public async oneOrNone<T>(query: string): Promise<T | null> {
		return this.connection.oneOrNone<T>(query);
	}
}
