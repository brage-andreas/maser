import type { InstanceData, InstanceIdResult } from "../../../typings.js";
import type { Client } from "../../../extensions/";

import { Instance } from "../../../extensions/";
import { REGEX } from "../../../constants.js";
import Postgres from "../postgres.js";

export default class InstanceManager extends Postgres {
	constructor(client: Client, guildId: string) {
		super(client, { schema: "guilds", table: `instances-${guildId}`, idKey: "instanceId", id: guildId });
	}

	public async createInstance(data: Partial<InstanceData>): Promise<Instance> {
		const patchedData = await this.patch(data);

		const columnNames = Object.keys(patchedData);
		const values = Object.values(patchedData);

		await this.createRow(columnNames, values);

		return new Instance(this.client, patchedData);
	}

	public async getInstance(instanceId: string): Promise<Instance | null> {
		if (!this.id) throw new Error("Guild id must be set");

		const query = `
			SELECT *
			FROM ${this.schema}."${this.table}"
			WHERE "guildId" = ${this.id}
			AND "${this.idKey}" = ${instanceId}
		`;

		const data = await this.oneOrNone<InstanceData>(query);
		return data ? new Instance(this.client, data) : null;
	}

	public async editInstance(data: Partial<InstanceData>) {
		/*const patchedData = await this.patch(data);

		const columnNames = Object.keys(patchedData);
		const values = Object.values(patchedData);

		await this.createRow(columnNames, values);

		return new Instance(this.client, patchedData);*/
	}

	private async patch(data: Partial<InstanceData>) {
		data.timestamp ??= Date.now();
		data.guildId ??= this.id ?? undefined;

		this.test("executorTag", data.executorTag);
		this.test("executorId", data.executorId, { id: true });
		this.test("targetTag", data.targetTag, { required: false });
		this.test("targetId", data.targetId, { id: true, required: false });
		this.test("guildId", data.guildId, { id: true });
		this.test("type", data.type);

		data.instanceId = await this.getId();

		return data as InstanceData;
	}

	private async getId(): Promise<number> {
		const query = `
			SELECT "${this.idKey}" FROM (
				SELECT "${this.idKey}"
				FROM ${this.schema}."${this.table}"
				ORDER BY "${this.idKey}" DESC
				LIMIT 1
			) AS _ ORDER BY "${this.idKey}" ASC;
		`;

		const { instanceId } = (await this.oneOrNone<InstanceIdResult>(query)) ?? { instanceId: 0 };
		return instanceId + 1;
	}

	private test(column: string, value: string | number | undefined, opt?: { id?: boolean; required?: boolean }): void;
	private test(column: string, value: string | undefined, opt?: { id?: true; required?: boolean }): void;
	private test(
		column: string,
		value: string | number | undefined,
		opt: { id?: boolean; required?: boolean } = { id: false, required: true }
	): void {
		opt.required ??= true;
		opt.id ??= false;

		if (value === undefined) {
			if (opt.required) throw new Error(`An argument for "${column}" must be provided`);
			else return;
		}

		if (opt.id && !REGEX.ID.test(value as string)) {
			throw new Error(`A valid argument for "${column}" must be provided (reading: ${value})`);
		}
	}
}
