import type { ApplicationCommandData, CommandInteraction, Guild, GuildMember } from "discord.js";
import type { Clint } from "./extensions/Clint";
import { CommandLogger } from "./utils/CommandLogger.js";

export interface Command {
	data: ApplicationCommandData;
	defaultHide: boolean;
	execute(interaction: any): Promise<void> | void;
}

export interface Event {
	execute(client: any, ...args: unknown[]): Promise<void> | void;
}

export interface CmdIntr extends CommandInteraction {
	logger: CommandLogger;
	member: GuildMember;
	client: Clint;
	guild: Guild;
}

export type ClientColors = Map<string, `#${string}`>;
