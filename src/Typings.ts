import type {
	ApplicationCommandData,
	CommandInteraction,
	Guild,
	GuildMember
} from "discord.js";

// >

export interface Command {
	data: ApplicationCommandData;
	execute(interaction: any): Promise<void> | void;
}

export interface Event {
	execute(client: any, ...args: unknown[]): Promise<void> | void;
}

export interface CmdIntr extends CommandInteraction {
	member: GuildMember;
	guild: Guild;

	// util
}
