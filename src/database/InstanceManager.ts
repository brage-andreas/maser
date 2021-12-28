import { type Client } from "discord.js";
import { REGEXP } from "../constants/index.js";
import InfoLogger from "../logger/InfoLogger.js";
import { Instance } from "../modules/index.js";
import type { InstanceData } from "../typings/database.js";
import Postgres from "./src/postgres.js";

export default class InstanceManager extends Postgres {
	private initialised = false;

	public constructor(client: Client<true>, guildId: string) {
		super(client, { schema: "guilds", table: `instances-${guildId}`, idKey: "instanceId", idValue: guildId });
	}

	public async initialise(): Promise<this> {
		if (!this.idValue) throw new Error("Guild id must be set");

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

	public async createInstance(data: Partial<InstanceData>, logToChannel = false): Promise<Instance> {
		if (!this.initialised) await this.initialise();

		const patchedData = await this.patch(data);
		const columnNames = Object.keys(patchedData);
		const values = Object.values(patchedData);

		await this.createRow(columnNames, values);

		const instance = await this.getInstance(patchedData.instanceId);

		if (!instance) throw new Error("Something really went wrong");

		const guild = this.client.guilds.cache.get(patchedData.guildId)?.name ?? "unknown name";

		new InfoLogger().log(
			`Created new instance with id: ${patchedData.instanceId}`,
			`in guild: "${guild}" (${patchedData.guildId})`,
			`of type: "${instance.type.toLowerCase()}" (${patchedData.type})`
		);

		if (logToChannel) {
			const message = await instance.channelLog();

			if (message) this.setURL(patchedData.instanceId, message.url);
		}

		return instance;
	}

	public async getInstance(instanceId: number | string): Promise<Instance | null> {
		if (!this.initialised) await this.initialise();

		const data = await this.getData(instanceId);

		return this._createInstance(data);
	}

	public async getLatestId(): Promise<number | null> {
		const query = `
			SELECT "${this.idKey}"
			FROM ${this.schema}."${this.table}"
			ORDER BY "${this.idKey}" DESC
			LIMIT 1
		`;

		const res = await this.oneOrNone<InstanceData>(query);

		return res?.instanceId ?? null;
	}

	public async getInstanceDataWithinRange(offset: number, limit = 5): Promise<InstanceData[] | null> {
		if (!this.initialised) await this.initialise();

		const validatedOffset = Math.ceil(offset) < 0 ? 0 : Math.ceil(offset);
		const validatedLimit = Math.ceil(limit) < 1 ? 1 : Math.ceil(limit);

		const query = `
			SELECT *
			FROM ${this.schema}."${this.table}"
			LIMIT ${validatedLimit} OFFSET ${validatedOffset}
		`;

		return await this.manyOrNone<InstanceData>(query);
	}

	public async editInstance(
		instanceId: number | string,
		partialData: Partial<InstanceData>
	): Promise<Instance | null> {
		if (!this.initialised) await this.initialise();

		const data = await this.patch(partialData).catch(() => null);

		if (!data) return null;

		data.edited = true;

		const columnNames = Object.keys(data);
		const values = Object.values(data);

		await this.updateRow(columnNames, values, `"instanceId"=${instanceId}`);

		return await this.getInstance(instanceId);
	}

	public async setURL(instanceId: number | string, url: string) {
		await this.updateRow(["url"], [url], `"instanceId"=${instanceId}`);

		return this;
	}

	private async getData(instanceId: number | string): Promise<InstanceData | null> {
		if (!this.initialised) await this.initialise();

		const query = `
			SELECT *
			FROM ${this.schema}."${this.table}"
			WHERE "${this.idKey}" = ${instanceId}
		`;

		return await this.oneOrNone<InstanceData>(query);
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

		data.edited ??= false;

		this.test("executorTag", data.executorTag);

		this.test("executorId", data.executorId, { id: true });

		this.test("targetTag", data.targetTag, { required: false });

		this.test("targetId", data.targetId, { id: true, required: false });

		this.test("guildId", data.guildId, { id: true });

		this.test("type", data.type);

		data.instanceId ??= await this.getId();

		Object.entries(data).forEach(([key]) => {
			// @ts-expect-error "expression of type 'string' can't be used to index type 'Partial<InstanceData>'""
			data[key] ??= "NULL";
		});

		return data as InstanceData;
	}

	private async getId(): Promise<number> {
		if (!this.initialised) await this.initialise();

		const query = `
			SELECT "${this.idKey}" FROM (
				SELECT "${this.idKey}"
				FROM ${this.schema}."${this.table}"
				ORDER BY "${this.idKey}" DESC
				LIMIT 1
			) AS _ ORDER BY "${this.idKey}" ASC;
		`;

		const res = await this.oneOrNone<InstanceData>(query);

		return (res?.instanceId ?? 0) + 1;
	}

	private test(column: string, value: string | null | undefined, opt?: { id?: true; required?: boolean }): void;
	private test(
		column: string,
		value: number | string | null | undefined,
		opt?: { id?: boolean; required?: boolean }
	): void;
	private test(
		column: string,
		value: number | string | null | undefined,
		opt: { id?: boolean; required?: boolean } = { id: false, required: true }
	): void {
		opt.required ??= true;

		opt.id ??= false;

		if (value === undefined)
			if (opt.required) throw new Error(`An argument for "${column}" must be provided`);
			else return;

		if (opt.id && !REGEXP.ID.test(value as string))
			throw new Error(`A valid argument for "${column}" must be provided (reading: ${value})`);
	}
}
