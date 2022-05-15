import { type Client } from "discord.js";
import { CaseTypes } from "../constants/database.js";
import { REGEXP } from "../constants/index.js";
import InfoLogger from "../logger/InfoLogger.js";
import Case from "../modules/Case.js";
import { type CaseData } from "../typings/database.js";
import Util from "../utils/index.js";
import Postgres from "./src/postgres.js";

export default class CaseManager extends Postgres {
	private initialised = false;

	public constructor(client: Client<true>, guildId: string) {
		super(client, {
			schema: "guilds",
			table: `cases-${guildId}`,
			idKey: "caseId",
			idValue: guildId
		});
	}

	public async initialise(): Promise<this> {
		if (!this.idValue) throw new Error("Guild ID must be set");

		const query = `
            CREATE TABLE IF NOT EXISTS guilds."cases-${this.idValue}"
            (
                "caseId" integer NOT NULL,
				"guildId" bigint NOT NULL,
				"executorAvatar" text,
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

                CONSTRAINT "cases-${this.idValue}_pkey" PRIMARY KEY ("caseId")
            )
        `;

		await this.none(query);

		this.initialised = true;

		return this;
	}

	public async createCase(
		data: Partial<CaseData>,
		logToChannel = false
	): Promise<Case> {
		if (!this.initialised) await this.initialise();

		const patchedData = await this.patch(data);
		const columnNames = Object.keys(patchedData);
		const values = Object.values(patchedData);

		await this.createRow(columnNames, values);

		const case_ = await this.getCase(patchedData.caseId);

		if (!case_) throw new Error("Something really went wrong");

		const guild =
			this.client.guilds.cache.get(patchedData.guildId)?.name ??
			"unknown name";

		new InfoLogger().log(
			`Created new case with ID: ${patchedData.caseId}`,
			`in guild: "${guild}" (${patchedData.guildId})`,
			`of type: "${case_.type.toLowerCase()}" (${patchedData.type})`
		);

		if (logToChannel) {
			const message = await case_.channelLog();

			if (message) this.setURL(patchedData.caseId, message.url);
		}

		return case_;
	}

	public async deleteCase(
		caseId: number,
		returnIfDeleted: true
	): Promise<Case>;
	public async deleteCase(
		caseId: number,
		returnIfDeleted?: false
	): Promise<null>;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async deleteCase(
		caseId: number,
		returnIfDeleted?: boolean
	): Promise<Case | null> {
		if (!this.initialised) await this.initialise();

		const case_ = await this.getCase(caseId);

		if (!case_) return null;

		this.deleteRow(`"caseId"='${caseId}'`);

		const guild =
			this.client.guilds.cache.get(case_.guildId)?.name ?? "unknown name";

		new InfoLogger().log(
			`Deleted case with ID: ${caseId}`,
			`in guild: "${guild}" (${case_.guildId})`,
			`of type: "${case_.type.toLowerCase()}" (${case_.type})`
		);

		return returnIfDeleted ? case_ : null;
	}

	public async getCase(caseId: number | string): Promise<Case | null> {
		if (!this.initialised) await this.initialise();

		const data = await this.getData(caseId);

		return this._createCase(data);
	}

	public async getLatestId(): Promise<number | null> {
		const query = `
			SELECT "${this.idKey}"
			FROM ${this.schema}."${this.table}"
			ORDER BY "${this.idKey}" DESC
			LIMIT 1
		`;

		const res = await this.oneOrNone<CaseData>(query);

		return res?.caseId ?? null;
	}

	public async getCaseDataWithinRange(
		offset: number,
		limit = 5
	): Promise<CaseData[] | null> {
		if (!this.initialised) await this.initialise();

		const validatedOffset = Math.ceil(offset) < 0 ? 0 : Math.ceil(offset);
		const validatedLimit = Math.ceil(limit) < 1 ? 1 : Math.ceil(limit);

		const query = `
			SELECT *
			FROM ${this.schema}."${this.table}"
			LIMIT ${validatedLimit} OFFSET ${validatedOffset}
		`;

		return await this.manyOrNone<CaseData>(query);
	}

	public async editCase(
		caseId: number | string,
		partialData: Partial<CaseData>
	): Promise<Case | null> {
		if (!this.initialised) await this.initialise();

		const data = await this.patch(partialData).catch(() => null);

		if (!data) return null;

		data.edited = true;

		const columnNames = Object.keys(data);
		const values = Object.values(data);

		await this.updateRow(columnNames, values, `"caseId"=${caseId}`);

		return await this.getCase(caseId);
	}

	public async setURL(
		caseId: number | string,
		url: string
	): Promise<CaseManager> {
		await this.updateRow(["url"], [url], `"caseId"=${caseId}`);

		return this;
	}

	public compactCases(cases: CaseData[]): string[] {
		return cases.map((c) => {
			const { caseId, url, reason } = c;
			const time = Util.date(c.timestamp);
			const type = CaseTypes[c.type];
			const idStr = url ? `[#${caseId}](${url})` : `#${caseId}`;

			return `${time} • ${idStr} ${type} - ${reason}`;
		});
	}

	private async getData(caseId: number | string): Promise<CaseData | null> {
		if (!this.initialised) await this.initialise();

		const query = `
			SELECT *
			FROM ${this.schema}."${this.table}"
			WHERE "${this.idKey}" = ${caseId}
		`;

		return await this.oneOrNone<CaseData>(query);
	}

	private _createCase(data: CaseData | null) {
		if (!data) return null;

		// bigints turn to strings via pg-promise
		data.timestamp = Number(data.timestamp);

		data.duration = data.duration ? Number(data.duration) : null;

		return new Case(this.client, data);
	}

	private async patch(data: Partial<CaseData>) {
		data.timestamp ??= Date.now();

		data.guildId ??= this.idValue ?? undefined;

		data.edited ??= false;

		this.test("executorTag", data.executorTag);

		this.test("executorId", data.executorId, { id: true });

		this.test("targetTag", data.targetTag, { required: false });

		this.test("targetId", data.targetId, { id: true, required: false });

		this.test("guildId", data.guildId, { id: true });

		this.test("type", data.type);

		data.caseId ??= await this.getId();

		Object.entries(data).forEach(([key]) => {
			// @ts-expect-error expression of type 'string' can't be used to index type 'Partial<CaseData>'
			data[key] ??= "NULL";
		});

		return data as CaseData;
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

		const res = await this.oneOrNone<CaseData>(query);

		return (res?.caseId ?? 0) + 1;
	}

	private test(
		column: string,
		value: string | null | undefined,
		opt?: { id?: true; required?: boolean }
	): void;
	private test(
		column: string,
		value: number | string | null | undefined,
		opt?: { id?: boolean; required?: boolean }
	): void;
	private test(
		column: string,
		value: number | string | null | undefined,
		opt: { id?: boolean; required?: boolean } = {
			id: false,
			required: true
		}
	): void {
		opt.required ??= true;

		opt.id ??= false;

		if (value === undefined)
			if (opt.required)
				throw new Error(`An argument for "${column}" must be provided`);
			else return;

		if (opt.id && !REGEXP.ID.test(value as string))
			throw new Error(
				`A valid argument for "${column}" must be provided (reading: ${value})`
			);
	}
}
