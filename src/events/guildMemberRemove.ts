import { type Client, type GuildMember } from "discord.js";

export async function execute(client: Client<true>, member: GuildMember) {
	if (member.pending) return;
	client.events.logger.memberLog(member, false);
}
