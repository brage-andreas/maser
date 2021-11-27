import type { InstanceData, InstanceIdResult } from "../typings.js";
import type { Client } from "../modules/index.js";

import { Instance } from "../modules/index.js";
import InfoLogger from "../utils/logger/InfoLogger.js";
import { REGEX } from "../constants.js";
import Postgres from "./src/postgres.js";

export default class InstanceManager extends Postgres {
	private initialised = false;

	constructor(client: Client, guildId: string) {
		super(client, { schema: "guilds", table: `instances-${guildId}`, idKey: "instanceId", id: guildId });
	}

	public async initialise(): Promise<this> {
		const query = `
            CREATE TABLE IF NOT EXISTS guilds."instances-${this.idValue}"
            (
                "instanceId" integer NOT NULL,
				"guildId" bigint NOT NULL,
				"referenceId" integer,
				"executorTag" text NOT NULL,
				"executorId" bigint NOT NULL,
				"targetTag" text,
				"timestamp" bigint NOT NULL,
				"targetId" bigint,
				"duration" bigint,
				"edited" boolean NOT NULL,
				"reason" text,
				"type" integer NOT NULL,
				"url" text,

                CONSTRAINT "instances-${this.idValue}_pkey" PRIMARY KEY ("instanceId")
            )
        `;

		await this.none(query);
		this.initialised = true;

		return this;
	}

	public async createInstance(data: Partial<InstanceData>): Promise<Instance> {
		if (!this.initialised) throw new Error("InstanceManager must be initialised before use");

		const patchedData = await this.patch(data);

		const columnNames = Object.keys(patchedData);
		const values = Object.values(patchedData);

		await this.createRow(columnNames, values);
		const instance = new Instance(this.client, patchedData);

		const guild = this.client.guilds.cache.get(patchedData.guildId)?.name ?? "unknown name";
		new InfoLogger().log(
			`Created new instance with id: ${patchedData.instanceId}`,
			`in guild: "${guild}" (${patchedData.guildId})`,
			`of type: "${instance.type.toLowerCase()}" (${patchedData.type})`
		);

		return instance;
	}

	public async getInstance(instanceId: string | number): Promise<Instance | null> {
		if (!this.initialised) throw new Error("InstanceManager must be initialised before use");
		if (!this.idValue) throw new Error("Guild id must be set");

		const query = `
			SELECT *
			FROM ${this.schema}."${this.table}"
			WHERE "guildId" = ${this.idValue}
			AND "${this.idKey}" = ${instanceId}
		`;

		const data = await this.oneOrNone<InstanceData>(query);
		return this._createInstance(data);
	}

	public async editInstance(instanceId: string | number, data: Partial<InstanceData>): Promise<Instance | null> {
		if (!this.initialised) throw new Error("InstanceManager must be initialised before use");

		try {
			data = await this.patch(data);
		} catch {
			return null;
		}

		const columnNames = Object.keys(data);
		const values = Object.values(data);

		await this.updateRow(columnNames, values, `"instanceId"=${instanceId}`);

		const newData = await this.getData(instanceId);
		return this._createInstance(newData);
	}

	private async getData(instanceId: string | number): Promise<InstanceData | null> {
		const query = `
			SELECT *
			FROM ${this.schema}."${this.table}"
			WHERE "guildId" = ${this.idValue}
			AND "${this.idKey}" = ${instanceId}
		`;

		return this.oneOrNone<InstanceData>(query);
	}

	private _createInstance(data: InstanceData | null) {
		if (!data) return null;

		// bigints turn to strings via pg-promise
		data.timestamp = Number(data.timestamp);
		data.duration = data.duration ? Number(data.duration) : null;

		return new Instance(this.client, data);
	}

	private async patch(data: Partial<InstanceData>) {
		data.timestamp ??= Date.now();
		data.guildId ??= this.idValue ?? undefined;

		this.test("executorTag", data.executorTag);
		this.test("executorId", data.executorId, { id: true });
		this.test("targetTag", data.targetTag, { required: false });
		this.test("targetId", data.targetId, { id: true, required: false });
		this.test("guildId", data.guildId, { id: true });
		this.test("type", data.type);

		data.instanceId ??= await this.getId();
		Object.entries(data).forEach(([key]) => {
			// @ts-expect-error
			data[key] ??= "NULL";
		});

		return data as InstanceData;
	}

	private async getId(): Promise<number> {
		const query = `
			SELECT "${this.idKey}" FROM (
				SELECT "${this.idKey}"
				FROM ${this.schema}."${this.table}"
                WHERE "guildId" = ${this.idValue}
				ORDER BY "${this.idKey}" DESC
				LIMIT 1
			) AS _ ORDER BY "${this.idKey}" ASC;
		`;

		const res = await this.oneOrNone<InstanceIdResult>(query);
		return (res?.instanceId ?? 0) + 1;
	}

	private test(column: string, value: string | null | undefined, opt?: { id?: true; required?: boolean }): void;
	private test(
		column: string,
		value: string | number | null | undefined,
		opt?: { id?: boolean; required?: boolean }
	): void;
	private test(
		column: string,
		value: string | number | null | undefined,
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
