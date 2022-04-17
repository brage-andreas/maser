import { type CommandInteraction, type ChatInputApplicationCommandData } from "discord.js";
import CaseManager from "../../database/CaseManager.js";
import { type CaseData } from "../../typings/database.js";
import { type Command } from "../../typings/index.js";
import { USER } from "./noread.methods.js";

const data: ChatInputApplicationCommandData = {
	name: "history",
	description: "Show the history of a user",
	options: [USER()]
};

async function execute(intr: CommandInteraction<"cached">) {
	const userOptionIsProvided = Boolean(intr.options.get("user")?.value);
	//const member = userOptionIsProvided ? intr.options.getMember("user") : intr.member;
	const user = userOptionIsProvided ? intr.options.getUser("user", true) : intr.user;

	// eslint-disable-next-line padding-line-between-statements
	const caseManager = new CaseManager(intr.client, intr.guildId);

	await caseManager.initialise();

	const cases = await caseManager.manyOrNone<CaseData>(`
		SELECT *
		FROM ${caseManager.schema}."${caseManager.table}"
		WHERE "${caseManager.table}"."targetId" = '${user.id}'
	`);

	if (!cases) {
		("lol");

		return;
	}

	const casesStr = caseManager.compactCases(cases);

	intr.editReply(casesStr.slice(0, 10).join("\n"));

	intr.logger.log("Command used");
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
