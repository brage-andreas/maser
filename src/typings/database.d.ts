import { NewsChannel, TextChannel } from "discord.js";
import { InstanceTypes } from "../constants/database.js";

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

export type PostgresResponses = PostresExists | ConfigData | InstanceData;

export interface PostresExists {
	exists: boolean;
}

/*
   ---------
    CONFIGS
   ---------
*/

export type ConfigTableColumns = "guildId" | "memberLogChannel" | "botLogChannel" | "modLogChannel";
export type ConfigChannelTypes = TextChannel | NewsChannel;

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
