import { type APIEmbed } from "discord-api-types/v9";
import {
	ButtonStyle,
	ComponentType,
	type APIButtonComponentWithCustomId,
	type ChatInputApplicationCommandData,
	type CommandInteraction
} from "discord.js";
import ms from "ms";
import CaseManager from "../../database/CaseManager.js";
import { e } from "../../emojis/index.js";
import type Logger from "../../loggers/index.js";
import ButtonManager from "../../modules/ButtonManager.js";
import type Case from "../../modules/Case.js";
import { type Command, type CommandOptions } from "../../typings/index.js";
import { createList, date, fullDate, listify } from "../../utils/index.js";
import { user } from "./noread.sharedCommandOptions.js";

const options: Partial<CommandOptions> = {
	private: true,
	wip: true
};

const data: ChatInputApplicationCommandData = {
	name: "history",
	description: "Show the history of a user",
	options: [user()]
};

async function execute(intr: CommandInteraction<"cached">, logger: Logger) {
	const userOptionIsProvided = Boolean(intr.options.get("user")?.value);

	const member = userOptionIsProvided
		? intr.options.getMember("user")
		: intr.member;

	const user = userOptionIsProvided
		? intr.options.getUser("user", true)
		: intr.user;

	const shortifyCase = (case_: Case) => {
		const stamp = date(case_.createdTimestamp, "D");
		const type = case_.type;
		const reason = case_.reason ?? "No reason provided";

		return `${stamp} ${case_} \`${type}\` ${reason}`;
	};

	const tablifyCases = (caseArray: Array<Case>) => {
		const longest = caseArray.reduce(
			(longest, case_) => {
				let { id, type, date } = { ...longest };

				if (id < case_.id.toString().length) {
					id = case_.id.toString().length;
				}

				if (type < case_.type.length) {
					type = case_.type.length;
				}

				const dateValue = Date.now() - case_.createdTimestamp;

				if (date < ms(dateValue, { long: true }).length) {
					date = ms(dateValue, { long: true }).length;
				}

				return { id, type, date };
			},
			{ id: 0, type: 0, date: 0 }
		);

		const casesTable = caseArray
			.map((c) => {
				const { id, type, date } = longest;

				// +1 because of the "#"
				const idStr = `#${c.id}`.padEnd(id + 1);

				const typeStr = c.type.padEnd(type);

				const dateValue = Date.now() - c.createdTimestamp;
				const dateStr = ms(dateValue, { long: true }).padEnd(date);

				const reasonStr = c.reason ?? "No reason provided";

				return `${dateStr} ago | ${idStr} | ${typeStr} | ${reasonStr}`;
			})
			.join("\n");

		const historyStr = `History of ${user.tag} (${user.id})`;

		return `${historyStr}\n${"-".repeat(historyStr.length)}\n${casesTable}`;
	};

	const caseManager = new CaseManager(intr.client, intr.guildId);
	const cases = await caseManager.getHistory(user.id);

	const shortCasesArray = cases.map((c) => shortifyCase(c));
	const shortCases = shortCasesArray.slice(0, 6);
	const excessCases = shortCasesArray.length - shortCases.length;

	/*
		creates an object like:
		{
			"mute": 1,
			"kick": 2
		}
	*/
	const embedFooterEntries = cases.reduce(
		(obj: Record<string, number>, case_) => {
			const type = case_.type.toLowerCase();
			obj[type] = (obj[type] ?? 0) + 1;

			return obj;
		},
		{}
	);

	const embedFooter = Object.entries(embedFooterEntries).map(
		([type, n]) => `${n} ${type}${n === 1 ? "" : "s"}`
	);

	const nickname = member?.nickname ? `\`${member.nickname}\`` : null;
	const roleMentions = member?.roles.cache.map((r) => r.toString());
	const roles = roleMentions && listify(roleMentions, { desiredLen: 4 });
	const joined = member?.joinedTimestamp
		? fullDate(member.joinedTimestamp)
		: null;

	const caseStr =
		shortCases.join("\n") +
		(0 < excessCases ? `\nand ${excessCases} more...` : "");

	const historyEmbed: APIEmbed = {
		author: {
			icon_url: (member ?? user).displayAvatarURL(),
			name: `${user.tag} (${user.id})`
		},
		fields: [
			{
				name: "Cases",
				value: shortCases.length ? caseStr : "No history"
			},
			{
				name: "User info",
				value: createList({
					Username: `${user}, \`${user.tag}\` (${user.id})`,
					Created: fullDate(user.createdTimestamp)
				})
			},
			{
				name: "Member info",
				value: createList({
					Nickname: nickname,
					Joined: joined,
					Roles: roles
				})
			}
		],
		footer: {
			text: embedFooter.join(", ") || "No history"
		}
	};

	const buttonManager = new ButtonManager();

	const outputButton: APIButtonComponentWithCustomId = {
		label: "Send full history",
		custom_id: "full_history",
		style: ButtonStyle.Secondary,
		emoji: { name: "📤" },
		type: ComponentType.Button
	};

	buttonManager.setRows([outputButton]);

	const msg = await intr.editReply({
		embeds: [historyEmbed],
		components: shortCases.length ? buttonManager.rows : []
	});

	logger.logInteraction(`Sent history of ${user.tag} (${user.id})`);

	if (!shortCases.length) {
		return;
	}

	const collector = buttonManager.setMessage(msg).createCollector();

	collector.on("collect", async (interaction) => {
		if (interaction.user.id !== intr.user.id) {
			interaction.reply({
				content: e`{cross} This button is not for you`,
				ephemeral: true
			});

			return;
		}

		await interaction.deferUpdate();

		const attachment = {
			attachment: Buffer.from(tablifyCases(cases)),
			name: `history-${user.id}.txt`
		};

		buttonManager.disable("full_history");

		await interaction.editReply({ components: buttonManager.rows });

		await interaction.followUp({
			files: [attachment],
			ephemeral: intr.ephemeral ?? true
		});

		logger.logInteraction(
			`Sent full history of ${user.tag} (${user.id}) as attachment`
		);
	});

	collector.on("end", () => {
		buttonManager.disable("full_history");

		intr.editReply({ components: buttonManager.rows }).catch(() => null);
	});
}

export const getCommand = () =>
	({
		data,
		execute,
		options
	} as Partial<Command>);
