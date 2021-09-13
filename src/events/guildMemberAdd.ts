import type { GuildMember } from "discord.js";
import type { Clint } from "../extensions/";

export async function execute(client: Clint, member: GuildMember) {
	if (member.pending) return;
	client.events.logger.memberLog(member, true);
}
