import type Discord, { NewsChannel, TextChannel, MessageEmbed, ChatInputApplicationCommandData } from "discord.js";
import type { InstanceTypes } from "./constants.js";
import type { CommandLogger } from "./utils/logger/";
import type CommandManager from "./modules/CommandManager.js";
import type ConfigManager from "./database/src/config/ConfigManager.js";
import type { Client } from "./modules/index.js";

type AllowedConfigTextChannels = TextChannel | NewsChannel;

export type ConfigColumns = "guildId" | "botLogChannel" | "modLogChannel" | "memberLogChannel" | "mutedRole";

export type ColorMap = Map<string, Color>;
export type Color = `#${string}`;

export interface CommandModule {
	getCommand: () => Partial<Command>;
}

export interface Command {
	execute: (interaction: CommandInteraction | ContextMenuInteraction) => Promise<void> | void;
	data: ChatInputApplicationCommandData;
	options: {
		defaultHide: boolean;
		logLevel: 2 | 1 | 0;
		private: boolean;
		wip: boolean;
	};
}

export interface Event {
	execute: (client: Client, ...args: unknown[]) => Promise<void> | void;
}

export interface ConfigCommandData {
	config: ConfigManager;
	method: string;
	option: string;
	intr: CommandInteraction;
}

export interface EvalOutput {
	embeds: MessageEmbed[];
	output: string;
	type: "output" | "error";
}

export interface PostgresOptions {
	idValue: string;
	schema: string;
	idKey: string;
	table: string;
}

export interface ConfigResult {
	guildId: string;
	memberLogChannel?: string | null;
	botLogChannel?: string | null;
	modLogChannel?: string | null;
	mutedRole?: string | null;
}

export interface ExistsResult {
	exists: boolean;
}

export interface InstanceData {
	instanceId: number;
	guildId: string;
	referenceId: number | null;
	executorTag: string;
	executorId: string;
	targetTag: string | null;
	timestamp: number;
	targetId: string | null;
	duration: number | null;
	edited: boolean;
	reason: string | null;
	type: InstanceTypes;
	url: string | null;
}

export interface InstanceIdResult {
	instanceId: number;
}

export type PgResponses = ConfigResult | ExistsResult | InstanceData | InstanceIdResult;
