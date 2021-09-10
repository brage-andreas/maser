import type { Guild, TextChannel } from "discord.js";
import { ConfigResult } from "../typings.js";
import Postgres from "./src/connection.js";

// TODO: refactor
// don't do it like this btw
// just about works now, will probably change it entirely

export class ConfigManager extends Postgres {
	private async one(query: string): Promise<ConfigResult | null> {
		return this.psql.one(query).catch(() => null);
	}

	private async none(query: string): Promise<boolean> {
		return this.psql
			.none(query)
			.then(() => true)
			.catch(() => false);
	}

	public botLogChannel = {
		get: async (guildResolvable: Guild | string) => {
			const guildId = typeof guildResolvable === "string" ? guildResolvable : guildResolvable.id;

			const query = `
                SELECT bot_log_channel_id
                FROM configs.guild_${guildId}
                WHERE id = ${guildId}
            `;

			const botLogChannelId = await this.one(query).then((result) => result?.bot_log_channel_id ?? null);
			if (!botLogChannelId) return null;

			const guild = this.client.guilds.cache.get(guildId);
			const channel = guild?.channels.cache.get(botLogChannelId);
			if (!channel || channel.type !== "GUILD_TEXT") return null;

			return channel as TextChannel;
		},

		set: (newChannel: TextChannel | string, guildResolvable: Guild | string) => {
			const channelId = typeof newChannel === "string" ? newChannel : newChannel.id;
			const guildId = typeof guildResolvable === "string" ? guildResolvable : guildResolvable.id;

			const query = `
                UPDATE configs.guild_${guildId}
                SET bot_log_channel_id=${channelId}
                WHERE id = ${guildId};
            `;

			return this.none(query);
		}
	};

	public memberLogChannel = {
		get: async (guildResolvable: Guild | string) => {
			const guildId = typeof guildResolvable === "string" ? guildResolvable : guildResolvable.id;

			const query = `
                SELECT member_log_channel_id
                FROM configs.guild_${guildId}
                WHERE id = ${guildId}
            `;

			const memberLogChannelId = await this.one(query).then((result) => result?.member_log_channel_id ?? null);
			if (!memberLogChannelId) return null;

			const guild = this.client.guilds.cache.get(guildId);
			const channel = guild?.channels.cache.get(memberLogChannelId);
			if (!channel || channel.type !== "GUILD_TEXT") return null;

			return channel as TextChannel;
		},

		set: (newChannel: TextChannel | string, guildResolvable: Guild | string) => {
			const channelId = typeof newChannel === "string" ? newChannel : newChannel.id;
			const guildId = typeof guildResolvable === "string" ? guildResolvable : guildResolvable.id;

			const query = `
                UPDATE configs.guild_${guildId}
                SET member_log_channel_id=${channelId}
                WHERE id = ${guildId};
            `;

			return this.none(query);
		}
	};
}
