import type { TextChannel } from "discord.js";
import { Clint } from "../extensions/Clint.js";
import { ConfigColumns, ConfigResult } from "../typings.js";
import Postgres, { CreatorOptions } from "./src/postgres.js";

// TODO: refactor

export class ConfigManager extends Postgres {
	constructor(client: Clint, options?: CreatorOptions) {
		super(client, options);
		this.setSchema("configs");
	}

	public botLogChannel = {
		get: async (): Promise<TextChannel | null> => {
			this.setTable("logs");
			return this.getChannel("bot_log_channel_id");
		},

		set: (newChannel: TextChannel | string): Promise<boolean> => {
			this.setTable("logs");
			return this.setChannel(newChannel, "bot_log_channel_id");
		}
	};

	public memberLogChannel = {
		get: async (): Promise<TextChannel | null> => {
			this.setTable("logs");
			return this.getChannel("member_log_channel_id");
		},

		set: (newChannel: TextChannel | string): Promise<boolean> => {
			this.setTable("logs");
			return this.setChannel(newChannel, "member_log_channel_id");
		}
	};

	private async getChannel(key: ConfigColumns): Promise<TextChannel | null> {
		if (!this.guildId) throw new Error("Guild id must be set to the ConfigManager");

		const query = `
                SELECT ${key}
                FROM configs.logs
                WHERE id = ${this.guildId}
            `;

		const channelId = await this.one<ConfigResult>(query).then((result) => result?.[key] ?? null);
		if (!channelId) return null;

		const guild = this.client.guilds.cache.get(this.guildId);
		const channel = guild?.channels.cache.get(channelId);
		if (!channel || channel.type !== "GUILD_TEXT") return null;

		return channel as TextChannel;
	}

	private async setChannel(newChannel: TextChannel | string, key: ConfigColumns): Promise<boolean> {
		const channelId = typeof newChannel === "string" ? newChannel : newChannel.id;

		this.setGuild(this.guildId).setSchema("configs");
		return this.updateRow("logs", [key], [channelId]);
	}
}
