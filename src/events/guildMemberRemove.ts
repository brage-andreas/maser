import type { GuildMember } from "discord.js";
import type { Client } from "../extensions/";

export async function execute(client: Client, member: GuildMember) {
	if (member.pending) return;
	client.events.logger.memberLog(member, false);
}
