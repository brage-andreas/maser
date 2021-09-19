import { Clint } from "../../extensions/";
import Postgres, { CreatorOptions } from "../src/postgres.js";

// TODO

export default class ConfigRoleManager extends Postgres {
	constructor(client: Clint, options?: CreatorOptions) {
		super(client, options);
		this.setTable("roles");
	}
}
