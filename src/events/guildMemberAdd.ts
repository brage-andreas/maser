import { type Client, type GuildMember } from "discord.js";

export async function execute(client: Client<true>, member: GuildMember) {
	if (member.pending) return;
	if (member.partial) await member.fetch();
	client.events.logger.memberLog(member, true);
}
