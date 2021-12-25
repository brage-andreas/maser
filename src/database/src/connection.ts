import postgres from "pg-promise";
import { PostgresResponses, PostresExists } from "../../typings/database.js";

// This will error with "Error: connect ECONNREFUSED 127.0.0.1:5432"
// if you don't have postgres installed

const singletonConnection = postgres()("postgres://postgres:admin@localhost:5432/maser");

export default class PostgresConnection {
	public readonly connection = singletonConnection;

	public async one<T extends PostgresResponses>(query: string): Promise<T> {
		return await this.connection.one<T>(query);
	}

	public async none(query: string): Promise<void> {
		return void (await this.connection.none(query));
	}

	public async oneOrNone<T extends Exclude<PostgresResponses, PostresExists>>(query: string): Promise<T | null> {
		return await this.connection.oneOrNone<T>(query);
	}

	public async manyOrNone<T extends Exclude<PostgresResponses, PostresExists>>(query: string): Promise<T[] | null> {
		const res = await this.connection.manyOrNone<T>(query);
		return res.length ? res : null;
	}
}
