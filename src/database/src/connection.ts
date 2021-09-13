import type { Clint } from "../../extensions/";
import postgres from "pg-promise";

const connectionString = "postgres://postgres:admin@localhost:5432/maser";
const connection = postgres()(connectionString);

export default class PostgresConnection {
	public client: Clint;
	public connection = connection;

	constructor(client: Clint) {
		this.client = client;
	}

	// TODO: this generic could probably be better
	// TODO: properly type everything this thing can return
	public async one<T>(query: string): Promise<T | null> {
		return this.connection.one(query);
	}

	public async none(query: string): Promise<boolean> {
		try {
			await this.connection.none(query);
			return true;
		} catch {
			return false;
		}
	}

	public async oneOrNone<T>(query: string): Promise<T | null> {
		return this.connection.oneOrNone(query);
	}
}
