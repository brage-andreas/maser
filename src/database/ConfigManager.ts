import type { Guild, TextChannel } from "discord.js";
import { ConfigColumns, ConfigResult } from "../typings.js";
import Postgres from "./src/connection.js";

// TODO: refactor

export class ConfigManager extends Postgres {
	public botLogChannel = {
		get: async (guildResolvable: Guild | string): Promise<TextChannel | null> => {
			return this.getChannel(guildResolvable, "bot_log_channel_id");
		},

		set: (newChannel: TextChannel | string, guildResolvable: Guild | string): Promise<boolean> => {
			return this.setChannel(newChannel, guildResolvable, "bot_log_channel_id");
		}
	};

	public memberLogChannel = {
		get: async (guildResolvable: Guild | string): Promise<TextChannel | null> => {
			return this.getChannel(guildResolvable, "member_log_channel_id");
		},

		set: (newChannel: TextChannel | string, guildResolvable: Guild | string): Promise<boolean> => {
			return this.setChannel(newChannel, guildResolvable, "member_log_channel_id");
		}
	};

	private async one(query: string): Promise<ConfigResult | null> {
		return this.psql.one(query).catch(() => null);
	}

	private async none(query: string): Promise<boolean> {
		return this.psql
			.none(query)
			.then(() => true)
			.catch(() => false);
	}

	private async getChannel(guildResolvable: Guild | string, key: ConfigColumns): Promise<TextChannel | null> {
		const guildId = typeof guildResolvable === "string" ? guildResolvable : guildResolvable.id;

		const query = `
                SELECT ${key}
                FROM configs.logs
                WHERE id = ${guildId}
            `;

		const channelId = await this.one(query).then((result) => result?.[key] ?? null);
		if (!channelId) return null;

		const guild = this.client.guilds.cache.get(guildId);
		const channel = guild?.channels.cache.get(channelId);
		if (!channel || channel.type !== "GUILD_TEXT") return null;

		return channel as TextChannel;
	}

	private async setChannel(
		newChannel: TextChannel | string,
		guildResolvable: Guild | string,
		key: ConfigColumns
	): Promise<boolean> {
		const channelId = typeof newChannel === "string" ? newChannel : newChannel.id;
		const guildId = typeof guildResolvable === "string" ? guildResolvable : guildResolvable.id;

		const query = `
                UPDATE configs.logs
                SET ${key}=${channelId}
                WHERE id = ${guildId};
            `;

		return this.none(query);
	}
}
