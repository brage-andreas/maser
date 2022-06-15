import {
	type Client,
	type GuildMember,
	type PartialGuildMember
} from "discord.js";

export async function execute(
	client: Client<true>,
	member: GuildMember | PartialGuildMember
) {
	if (member.pending) {
		return;
	}

	if (member.partial) {
		await member.fetch();
	}

	client.eventHandler.logger.memberLog(member, true);
}
