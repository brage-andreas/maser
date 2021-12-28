import type { NewsChannel, TextChannel } from "discord.js";
import type { InstanceTypes } from "../constants/database.js";

/*
   --------
    GLOBAL
   --------
*/

export interface PostgresOptions {
	idValue: string;
	schema: string;
	idKey: string;
	table: string;
}

export type PostgresResponses = ConfigData | InstanceData | PostresExists;

export interface PostresExists {
	exists: boolean;
}

/*
   ---------
    CONFIGS
   ---------
*/

export type ConfigTableColumns = "botLogChannel" | "guildId" | "memberLogChannel" | "modLogChannel";
export type ConfigChannelTypes = NewsChannel | TextChannel;

export interface ConfigData {
	guildId?: string;
	memberLogChannel?: string | null;
	botLogChannel?: string | null;
	modLogChannel?: string | null;
}

/*
   ----------
    INSTANCE
   ----------
*/

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
