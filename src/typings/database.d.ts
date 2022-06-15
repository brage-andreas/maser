export interface ConfigData {
	guildId: string;
	botLogChId?: string | null;
	memberLogChId?: string | null;
	modLogChId?: string | null;
}

export interface CaseData {
	caseId: number;
	createdTimestamp: Date;
	edited: boolean;
	expirationTimestamp: Date | null;
	guildId: string;
	logMessageURL: string | null;
	modId: string;
	modTag: string;
	reason: string | null;
	referencedCaseId: number | null;
	targetId: string | null;
	targetTag: string | null;
	type: number;
}

export type CreateCaseData = Omit<
	CaseData,
	"caseId" | "createdTimestamp" | "edited" | "guildId"
>;
