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

export type ConfigColumns = "id" | "bot_log_channel_id" | "member_log_channel_id" | "muted_role_id";

export type Color = `#${string}`;
export type ColorMap = Map<string, Color>;

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

interface CommandInteractionOptionResolver extends Discord.CommandInteractionOptionResolver {
	getMember: (name: string, required = false) => GuildMember | null;
}

// TODO: fix this
export interface CommandInteraction extends Discord.CommandInteraction {
	options: CommandInteractionOptionResolver;
	logger: CommandLogger;
	member: GuildMember;
	client: Client;
	guild: Guild;
}

export interface ConfigResult {
	id?: string;
	bot_log_channel_id?: string | null;
	member_log_channel_id?: string | null;
	muted_role_id?: string | null;
}

export interface ExistsResult {
	exists: boolean;
}

export interface ConfigCommandData {
	config: ConfigManager;
	method: string;
	option: string;
	intr: CommandInteraction;
}

type AllowedConfigTextChannels = TextChannel | NewsChannel;

export interface RawEvalOutput {
	result: any;
	time: number;
}

export interface EvalOutput {
	embeds: MessageEmbed[];
	output: string;
	type: "output" | "error";
}

export interface PostgresOptions {
	guildResolvable?: Guild | string | null;
	schema?: string | null;
	table?: string | null;
}
