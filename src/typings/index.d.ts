import type {
	Client,
	ChatInputApplicationCommandData,
	ContextMenuInteraction,
	CommandInteraction,
	MessageEmbed,
	NewsChannel,
	TextChannel
} from "discord.js";
import type { InstanceTypes } from "../constants.js";
import type ConfigManager from "../database/ConfigManager.js";

/* * * * * * */

export type AllowedConfigTextChannels = TextChannel | NewsChannel;
export type ConfigColumns = "guildId" | "botLogChannel" | "modLogChannel" | "memberLogChannel" | "mutedRole";
export type PgResponses = ConfigResult | ExistsResult | InstanceData | InstanceIdResult;

export interface CommandModule {
	getCommand: () => Partial<Command>;
}

export interface Command {
	execute: (interaction: CommandInteraction<"cached"> | ContextMenuInteraction<"cached">) => Promise<void> | void;
	data: ChatInputApplicationCommandData;
	options: CommandOptions;
}

export interface CommandOptions {
	defaultHide: boolean;
	logLevel: 2 | 1 | 0;
	private: boolean;
	wip: boolean;
}

export interface Event {
	execute: (client: Client, ...args: unknown[]) => Promise<void> | void;
}

export interface ConfigCommandData {
	config: ConfigManager;
	method: string;
	option: string;
	intr: CommandInteraction<"cached">;
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
