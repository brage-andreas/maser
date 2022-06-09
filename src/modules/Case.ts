// TODO: refactor

import { type APIEmbed } from "discord-api-types/v9";
import { type Client, type TextBasedChannel } from "discord.js";
import { CaseTypes } from "../constants/database.js";
import { COLORS, REGEXP } from "../constants/index.js";
import CaseManager from "../database/CaseManager.js";
import ConfigManager from "../database/ConfigManager.js";
import { type CaseData } from "../typings/database.js";

const getHexColor = (type: CaseTypes): number => {
	switch (type) {
		case CaseTypes.Untimeout:
			return COLORS.green;

		case CaseTypes.Softban:
			return COLORS.orange;

		case CaseTypes.Timeout:
			return COLORS.black;

		case CaseTypes.Unban:
			return COLORS.green;

		case CaseTypes.Kick:
			return COLORS.yellow;

		case CaseTypes.Warn:
			return COLORS.blue;

		case CaseTypes.Ban:
			return COLORS.red;

		default:
			return COLORS.invisible;
	}
};

const getType = (type: CaseTypes): string => {
	switch (type) {
		case CaseTypes.Softban:
			return "Softban";

		case CaseTypes.Unban:
			return "Unban";

		case CaseTypes.Kick:
			return "Kick";

		case CaseTypes.Warn:
			return "Warn";

		case CaseTypes.Timeout:
			return "Timeout";

		case CaseTypes.Untimeout:
			return "Untimeout";

		case CaseTypes.Ban:
			return "Ban";

		default:
			return "Unknown type";
	}
};

export default class Case {
	public readonly client: Client;
	public readonly rawCaseData: CaseData;

	public readonly createdTimestamp: number;
	public readonly duration: number | null;
	public readonly edited: boolean;
	public readonly embedHexColor: number;
	public readonly expirationTimestamp: number | null;
	public readonly guildId: string;
	public readonly id: number;
	public readonly logMessageUrl: string | null;
	public readonly mod: { tag: string; id: string };
	public readonly referencedCaseId: number | null;
	public readonly reason: string | null;
	public readonly target: { tag: string | null; id: string | null };
	public readonly type: string;
	public readonly hexColor: number | undefined;

	public constructor(client: Client, caseData: CaseData) {
		this.client = client;
		this.rawCaseData = caseData;

		const start = caseData.createdTimestamp.getTime();
		const end = caseData.expirationTimestamp?.getTime();

		this.createdTimestamp = caseData.createdTimestamp.getTime();
		this.duration = end ? end - start : null;
		this.edited = caseData.edited;
		this.embedHexColor = getHexColor(caseData.type);

		this.expirationTimestamp =
			caseData.expirationTimestamp?.getTime() ?? null;

		this.guildId = caseData.guildId;
		this.id = caseData.caseId;
		this.logMessageUrl = caseData.logMessageURL;

		this.mod = {
			tag: caseData.modTag,
			id: caseData.modId
		};

		this.referencedCaseId = caseData.referencedCaseId;
		this.reason = caseData.reason;

		this.target = {
			tag: caseData.targetTag,
			id: caseData.targetId
		};

		this.type = getType(caseData.type);
	}

	public async getReferencedCase() {
		if (!this.rawCaseData.referencedCaseId) {
			return null;
		}

		return await new CaseManager(this.client, this.guildId).getCase(
			this.rawCaseData.referencedCaseId
		);
	}

	public async toEmbed(): Promise<APIEmbed> {
		const caseEmbed: APIEmbed = {
			author: {
				name: `${this.mod.tag} (${this.mod.id})`
			},
			footer: {
				text: `#${this.id} ${this.edited ? "• Edited" : ""}`
			},
			timestamp: this.createdTimestamp.toString(),
			color: this.hexColor
		};

		const description = [`**Type**: ${this.type}`];

		if (this.target.tag || this.target.id) {
			const targetTag = this.target.tag ?? "Name unavailable";
			const targetId = this.target.id ?? "ID unavailable";

			description.push(`**Target**: \`${targetTag}\` (${targetId})`);
		}

		if (this.reason) {
			description.push(`**Reason**: ${this.reason}`);
		}

		if (this.duration && this.type === "Mute") {
			description.push(`**Duration**: ${this.duration}`);
		}

		if (this.referencedCaseId) {
			const referenceLogUrl = await this.getReferencedCase().then(
				(res) => res?.logMessageUrl
			);

			const str = referenceLogUrl
				? `[Case #${this.referencedCaseId}](${referenceLogUrl})`
				: `Case #${this.referencedCaseId}`;

			description.push(`**Reference**: ${str}`);
		}

		caseEmbed.description = description.join("\n");

		return caseEmbed;
	}

	public async channelLog() {
		const channel = await new ConfigManager(
			this.client,
			this.guildId
		).get.modLogChannel();

		if (!channel?.isTextBased()) {
			return false;
		}

		const url = await channel
			.send({ embeds: [await this.toEmbed()] })
			.then((msg) => msg.url)
			.catch(() => null);

		if (!url) {
			return false;
		}

		await new CaseManager(this.client, this.guildId).setLogMessageURL(
			this.id,
			url
		);

		return true;
	}

	public async updateLogMessage() {
		const editedRawCaseData = this.rawCaseData;
		editedRawCaseData.edited = true;

		const { rawCaseData } = await new CaseManager(
			this.client,
			this.guildId
		).editCase(editedRawCaseData);

		const [channel, messageId] = this._getLogMessageChannel();

		if (!channel || !messageId) {
			return;
		}

		return await channel.messages
			.edit(messageId, {
				embeds: [await new Case(this.client, rawCaseData).toEmbed()]
			})
			.then(() => true)
			.catch(() => false);
	}

	public async deleteLogMessage() {
		const [channel, messageId] = this._getLogMessageChannel();

		if (!channel || !messageId) {
			return;
		}

		return await channel.messages
			.delete(messageId)
			.then(() => true)
			.catch(() => false);
	}

	private _getLogMessageChannel(): [] | [TextBasedChannel, string] {
		if (!this.rawCaseData.logMessageURL) {
			return [];
		}

		// Turns discord.com/channels/<guild id>/<channel id>/<message id>
		// into [<guild id>, <channel id>, <message id>] and destructures it
		const [guildId, channelId, messageId] = [
			...this.rawCaseData.logMessageURL.matchAll(
				new RegExp(REGEXP.ID, "g")
			)
		].map((e) => (Array.isArray(e) ? e[0] : e));

		if (!guildId || !channelId || !messageId) {
			return [];
		}

		const channel = this.client.guilds.cache
			.get(guildId)
			?.channels.cache.get(channelId);

		if (!channel?.isTextBased()) {
			return [];
		}

		return [channel, messageId];
	}
}
