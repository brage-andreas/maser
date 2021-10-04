import type Discord, {
	ApplicationCommandData,
	Guild,
	GuildMember,
	NewsChannel,
	StoreChannel,
	TextChannel
} from "discord.js";
import type { CommandLogger } from "./utils/logger/CommandLogger.js";
import type ConfigManager from "./database/config/ConfigManager.js";
import type { Client } from "./extensions/";

export type ConfigColumns = "id" | "bot_log_channel_id" | "member_log_channel_id";

export type Color = `#${string}`;
export type ColorMap = Map<string, Color>;

export interface Command {
	execute(interaction: CommandInteraction): Promise<void> | void;
	defaultHide?: boolean;
	priv?: boolean; // "private" isn't allowed
	data: ApplicationCommandData;
}

export interface Event {
	execute(client: Client, ...args: unknown[]): Promise<void> | void;
}

export interface CommandInteraction extends Discord.CommandInteraction {
	logger: CommandLogger;
	member: GuildMember;
	client: Client;
	guild: Guild;
}

export interface ConfigResult {
	id?: string;
	bot_log_channel_id?: string | null;
	member_log_channel_id?: string | null;
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

type AllowedConfigTextChannels = TextChannel | NewsChannel | StoreChannel;
