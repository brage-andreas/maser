import { type GuildMember, type PartialGuildMember } from "discord.js";
import Logger from "../loggers/index.js";

export function execute(member: GuildMember | PartialGuildMember) {
	if (member.pending) {
		return;
	}

	// TODO: channel logging

	const logger = new Logger({
		type: "MEMBER LEAVE",
		colour: "yellow"
	});

	logger.log(
		`${member.user.tag} (${member.user.id}) left ${member.guild.name} (${member.guild.id})`
	);
}
