import {
	type Client,
	type GuildMember,
	type PartialGuildMember
} from "discord.js";

export function execute(
	client: Client<true>,
	member: GuildMember | PartialGuildMember
) {
	if (member.pending) {
		return;
	}

	client.eventHandler.logger.memberLog(member, false);
}
