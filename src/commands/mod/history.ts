import { type APIEmbed } from "discord-api-types/v9";
import {
	type ChatInputApplicationCommandData,
	type CommandInteraction
} from "discord.js";
import { CaseTypes } from "../../constants/database.js";
import CaseManager from "../../database/CaseManager.js";
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

	const caseManager = new CaseManager(intr.client, intr.guildId);
	const cases = await caseManager.getHistory(user.id);

	const caseFooterObj: Record<string, number> = {};

	cases.forEach(({ type }) => {
		caseFooterObj[type] = (caseFooterObj[type] ?? 0) + 1;
	});

	const caseFooterArr: Array<string> = [];

	for (const [type, amount] of Object.entries(caseFooterObj)) {
		caseFooterArr.push(
			`${amount} ${CaseTypes[Number(type)].toLowerCase()}s`
		);
	}

	// const compactedCases = rawCases
	//		? caseManager.compactCases(rawCases)
	//		: ["No history"];
	const compactedCases = ["No history"];

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
				value: "..."
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
