import { type APIEmbed } from "discord-api-types/v9";
import {
	type ChatInputApplicationCommandData,
	type CommandInteraction
} from "discord.js";
import { CaseTypes } from "../../constants/database.js";
import CaseManager from "../../database/CaseManager.js";
import { type CaseData } from "../../typings/database.js";
import { type Command } from "../../typings/index.js";
import Util from "../../utils/index.js";
import { USER } from "./noread.methods.js";

const data: ChatInputApplicationCommandData = {
	name: "history",
	description: "Show the history of a user",
	options: [USER()]
};

async function execute(intr: CommandInteraction<"cached">) {
	const userOptionIsProvided = Boolean(intr.options.get("user")?.value);

	const member = userOptionIsProvided
		? intr.options.getMember("user")
		: intr.member;

	const user = userOptionIsProvided
		? intr.options.getUser("user", true)
		: intr.user;

	// eslint-disable-next-line padding-line-between-statements
	const caseManager = new CaseManager(intr.client, intr.guildId);

	await caseManager.initialise();

	const rawCases = await caseManager.manyOrNone<CaseData>(`
		SELECT *
		FROM ${caseManager.schema}."${caseManager.table}"
		WHERE "${caseManager.table}"."targetId" = '${user.id}'
		ORDER BY "caseId" DESC
	`);

	const caseFooterArr: Array<string> = [];

	const caseFooterObj: Record<number, number> = {
		0: 0,
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0
	};

	rawCases?.forEach(({ type }) => caseFooterObj[type]++);

	for (const [type, amount] of Object.entries(caseFooterObj)) {
		caseFooterArr.push(
			`${amount} ${CaseTypes[Number(type)].toLowerCase()}s`
		);
	}

	const compactedCases = rawCases
		? caseManager.compactCases(rawCases)
		: ["No history"];

	const [caseList, rest] = Util.listify(compactedCases, 5);

	const casesString = `• ${caseList.join("\n• ")}${
		rest ? `\n${rest} more...` : ""
	}`;

	const historyEmbed: APIEmbed = {
		author: {
			icon_url: (member ?? user).displayAvatarURL(),
			name: `${user.tag} (${user.id})`
		},
		fields: [
			{
				name: "Cases",
				value: casesString
			},
			{
				name: "Info",
				value: "lol"
			}
		],
		footer: { text: caseFooterArr.join(", ") }
	};

	intr.editReply({ embeds: [historyEmbed] });

	intr.logger.log("Command used");
}

export const getCommand = () =>
	({
		data,
		execute
	} as Partial<Command>);
