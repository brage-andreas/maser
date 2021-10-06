import { PostgresOptions } from "../../typings.js";
import { Client } from "../../extensions/";
import Postgres from "../src/postgres.js";

// TODO

export default class ConfigRoleManager extends Postgres {
	constructor(client: Client, options?: PostgresOptions) {
		super(client, options);
		this.setTable("roles");
	}
}
