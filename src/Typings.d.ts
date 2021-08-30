import type { ApplicationCommandData, CommandInteraction, Guild, GuildMember } from "discord.js";
import type { Clint } from "./extensions/Clint";
import type { CommandLogger } from "./utils/logger/CommandLogger.js";

export type ClientColors = Map<string, `#${string}`>;

export type LoggerTypes = "COMMAND" | "ERROR" | "EVENT" | "INFO";

export interface Command {
	data: ApplicationCommandData;
	defaultHide: boolean;
	execute(interaction: CmdIntr): Promise<void> | void;
}

export interface Event {
	execute(client: Clint, ...args: unknown[]): Promise<void> | void;
}

// TODO: module augment instead of monkey patch
export interface CmdIntr extends CommandInteraction {
	logger: CommandLogger;
	client: Clint;

	member: GuildMember;
	guild: Guild;
}
