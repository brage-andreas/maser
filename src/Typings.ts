import type { ApplicationCommandData, CommandInteraction, Guild, GuildMember } from "discord.js";
import type { Clint } from "./extensions/Clint";

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
	client: Clint;
	guild: Guild;
}
