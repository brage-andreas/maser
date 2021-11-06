import type Discord, {
	Guild,
	GuildMember,
	NewsChannel,
	StoreChannel,
	TextChannel,
	MessageEmbed,
	UserApplicationCommandData,
	MessageApplicationCommandData,
	ChatInputApplicationCommandData
} from "discord.js";
import type { CommandLogger } from "./utils/logger/";
import type ConfigManager from "./database/src/config/ConfigManager.js";
import type { Client } from "./extensions/";

type AllowedConfigTextChannels = TextChannel | NewsChannel;

// Slightly borked
interface CommandInteractionOptionResolver extends Discord.CommandInteractionOptionResolver {
	getMember: (name: string, required?: boolean) => GuildMember | null;
}

export type ConfigColumns = "guildId" | "botLogChannel" | "memberLogChannel" | "mutedRole";

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

export interface CommandInteraction extends Discord.CommandInteraction<"cached"> {
	options: CommandInteractionOptionResolver;
	logger: CommandLogger;
	client: Client;
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
	id: string;
	schema: string;
	idKey: string;
	table: string;
}

export interface ConfigResult {
	guildId: string;
	memberLogChannel?: string | null;
	botLogChannel?: string | null;
	mutedRole?: string | null;
}

export interface ExistsResult {
	exists: boolean;
}

export interface InstanceData {
	instanceId: number;
	guildId: string;
	referenceId?: number;
	executorTag: string;
	executorId: string;
	targetTag?: string;
	timestamp: number;
	targetId?: string;
	duration?: number;
	reason?: string;
	type: InstanceTypes;
}

export interface InstanceIdResult {
	instanceId: number;
}

export type PgResponses = ConfigResult | ExistsResult | InstanceData | InstanceIdResult;
