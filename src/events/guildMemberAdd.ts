import { type GuildMember, type PartialGuildMember } from "discord.js";
import Logger from "../loggers/index.js";

export function execute(member: GuildMember | PartialGuildMember) {
	if (member.pending) {
		return;
	}

	if (member.partial) {
		// await member.fetch();
	}

	// TODO: channel logging

	const logger = new Logger({
		type: "MEMBER JOIN",
		colour: "yellow"
	});

	logger.log(
		`${member.user.tag} (${member.user.id}) joined ${member.guild.name} (${member.guild.id})`
	);
}
