import { oneLine } from "common-tags";
import {
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import { CaseTypes } from "../../constants/database.js";
import CaseManager from "../../database/CaseManager.js";
import { e } from "../../emojis/index.js";
import type Logger from "../../loggers/index.js";
import { ConfirmationButtons } from "../../modules/ButtonManager.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import { bold } from "../../utils/discordMarkdown.js";
import { createList } from "../../utils/index.js";
import { reason, user } from "./noread.sharedCommandOptions.js";

const options: Partial<CommandOptions> = { private: true };

const data: ChatInputApplicationCommandData = {
	name: "warn",
	description: "Warns a user",
	options: [user(true), reason("kick")]
};

function execute(intr: ChatInputCommandInteraction<"cached">, logger: Logger) {
	const target = intr.options.getMember("user");
	const reason = intr.options.getString("reason");

	if (!target) {
		intr.editReply(
			e`{cross} The user to target was not found in this server`
		);

		return;
	}

	if (target.id === intr.user.id) {
		intr.editReply(e`{cross} You cannot do this action on yourself`);

		return;
	}

	if (target.id === intr.client.user.id) {
		intr.editReply(e`{cross} I cannot do this action on myself`);

		return;
	}

	if (target.id === intr.guild.ownerId) {
		intr.editReply(
			e`{cross} The user to target is the owner of this server`
		);

		return;
	}

	const info = createList({
		Reason: reason ?? "No reason provided",
		Target: `${target.user.tag} (${target.id})`
	});

	const query = `${oneLine(e`
			{warning} Are you sure you want to warn
			${bold(target.user.tag)} (${target.id})?
		`)}\n\n${info}`;

	const collector = new ConfirmationButtons({
		authorId: intr.user.id,
		inverted: true
	})
		.setInteraction(intr)
		.setQuery(query);

	collector
		.start({ noReply: true })
		.then(async () => {
			const cases = new CaseManager(intr.client, intr.guildId);

			const case_ = await cases.createCase(
				{
					expirationTimestamp: null,
					logMessageURL: null,
					modId: intr.user.id,
					modTag: intr.user.tag,
					reason,
					referencedCaseId: null,
					targetId: target.id,
					targetTag: target.user.tag,
					type: CaseTypes.Warn
				},
				{ channelLog: true }
			);

			logger.logInteraction(
				`Warned ${target.user.tag} (${target.id}) ${
					reason
						? `with reason: "${reason}"`
						: "with no reason provided"
				}`
			);

			intr.editReply({
				content: `${oneLine(e`
							{check} Successfully ${bold`warned ${target.user.tag}`}
							(${target.id}) in case ${bold`#${case_.id}`}
						`)}\n\n${info}`,
				components: []
			});
		})
		.catch(() => {
			intr.editReply({
				content: e`{check} Gotcha. Command cancelled`,
				components: []
			});
		});
}

export const getCommand = () =>
	({
		data,
		options,
		execute
	} as Partial<Command>);
