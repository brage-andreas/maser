import type { ApplicationCommandData, CommandInteraction, Guild, GuildMember } from "discord.js";
import type { Clint } from "./extensions/Clint";
import type { CommandLogger } from "./utils/logger/CommandLogger.js";

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
	client: Clint;

	member: GuildMember;
	guild: Guild;
}

export type ClientColors = Map<string, `#${string}`>;

export type LoggerTypes = "COMMAND" | "ERROR" | "EVENT" | "INFO";
