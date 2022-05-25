import { type Client } from "discord.js";
import Case from "../modules/Case.js";
import type { CaseData } from "../typings/database.js";
import prisma from "./prisma.js";

export default class CaseManager {
	public readonly prisma = prisma;
	public readonly client: Client<true>;
	public guildId: string;

	public constructor(client: Client<true>, guildId: string) {
		this.guildId = guildId;
		this.client = client;
	}

	public async createCase(
		data: Omit<
			CaseData,
			"caseId" | "createdTimestamp" | "edited" | "guildId"
		>,
		channelLog = true
	) {
		// TODO: channel log
		channelLog;

		const lastId = await this.getLastCaseId();

		const case_ = await this.prisma.cases.create({
			data: {
				...data,
				guildId: this.guildId,
				caseId: lastId + 1
			}
		});

		return new Case(this.client, case_);
	}

	public async deleteCase(caseId: number) {
		const data = await this.prisma.cases.delete({
			where: {
				caseId_guildId: {
					guildId: this.guildId,
					caseId
				}
			}
		});

		const case_ = new Case(this.client, data);

		await case_.deleteLogMessage();

		return case_;
	}

	public async getCase(caseId: number) {
		const data = await this.prisma.cases.findFirst({
			where: {
				guildId: this.guildId,
				caseId
			},
			orderBy: {
				caseId: "desc"
			}
		});

		return data ? new Case(this.client, data) : null;
	}

	public async getHistory(userId: string) {
		const data = await this.prisma.cases.findMany({
			where: {
				guildId: this.guildId,
				targetId: userId
			},
			orderBy: {
				caseId: "desc"
			}
		});

		return data.map((case_) => new Case(this.client, case_));
	}

	public async getLastCaseId() {
		return await this.prisma.cases
			.findFirst({
				where: {
					guildId: this.guildId
				},
				orderBy: {
					caseId: "desc"
				},
				select: {
					caseId: true
				}
			})
			.then((res) => res?.caseId ?? 0);
	}

	// public async getCaseDataWithinRange() {}

	public async editCase(data: CaseData) {
		const case_ = await this.prisma.cases.update({
			where: {
				caseId_guildId: {
					guildId: this.guildId,
					caseId: data.caseId
				}
			},
			data
		});

		return new Case(this.client, case_);
	}

	public async setLogMessageURL(caseId: number, url: string) {
		const case_ = await this.prisma.cases.update({
			where: {
				caseId_guildId: {
					guildId: this.guildId,
					caseId
				}
			},
			data: {
				logMessageURL: url
			}
		});

		return new Case(this.client, case_);
	}

	// public async compactCases() {}

	/*
	private async getData() {}

	private async _createCase() {}

	private async patch() {}

	private async getId() {}
	*/
}
