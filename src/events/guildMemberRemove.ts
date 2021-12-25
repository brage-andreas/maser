import { type Client, type PartialGuildMember } from "discord.js";

export async function execute(client: Client<true>, member: PartialGuildMember) {
	if (member.pending) return;
	client.events.logger.memberLog(member, false);
}
