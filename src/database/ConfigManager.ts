import { type Client, type TextBasedChannel } from "discord.js";
import prisma from "./prisma.js";

export default class ConfigManager {
	public readonly prisma = prisma;
	public readonly client: Client<true>;
	public guildId: string;

	public readonly get = {
		botLogChannel: async () => this._get({ key: "botLogChId" }),
		memberLogChannel: async () => this._get({ key: "memberLogChId" }),
		modLogChannel: async () => this._get({ key: "modLogChId" }),

		raw: {
			botLogChannel: async () =>
				this._get({ key: "botLogChId", raw: true }),
			memberLogChannel: async () =>
				this._get({ key: "memberLogChId", raw: true }),
			modLogChannel: async () =>
				this._get({ key: "modLogChId", raw: true })
		}
	};

	public readonly set = {
		botLogChannel: async (channelId: string) =>
			this._set("botLogChId", channelId),

		memberLogChannel: async (channelId: string) =>
			this._set("memberLogChId", channelId),

		modLogChannel: async (channelId: string) =>
			this._set("modLogChId", channelId)
	};

	public constructor(client: Client<true>, guildId: string) {
		this.guildId = guildId;
		this.client = client;
	}

	public async getAll() {
		return await this.prisma.configs.findUnique({
			where: {
				guildId: this.guildId
			}
		});
	}

	public async setAll(data: {
		botLogChId?: string;
		memberLogChId?: string;
		modLogChId?: string;
	}) {
		return await this.prisma.configs.upsert({
			update: data,
			create: {
				...data,
				guildId: this.guildId
			},
			where: {
				guildId: this.guildId
			}
		});
	}

	private async _get(options: {
		key: "botLogChId" | "memberLogChId" | "modLogChId";
	}): Promise<TextBasedChannel | null>;
	private async _get(options: {
		key: "botLogChId" | "memberLogChId" | "modLogChId";
		raw: true;
	}): Promise<string | null>;
	private async _get(options: {
		key: "botLogChId" | "memberLogChId" | "modLogChId";
		raw?: boolean;
	}): Promise<TextBasedChannel | string | null> {
		const { key, raw } = options;

		const channelId = await this.prisma.configs
			.findUnique({
				where: {
					guildId: this.guildId
				},
				select: {
					[key]: true
				}
			})
			.then((res: Record<string, string | null> | null) => res?.[key]);

		if (!channelId) {
			return null;
		}

		if (raw) {
			return channelId;
		}

		const channel = this.client.channels.cache.get(channelId);

		return channel?.isTextBased() ? channel : null;
	}

	private async _set(
		key: "botLogChId" | "memberLogChId" | "modLogChId",
		channelId: string
	) {
		await this.prisma.configs.upsert({
			create: {
				guildId: this.guildId,
				[key]: channelId
			},
			update: {
				[key]: channelId
			},
			where: {
				guildId: this.guildId
			}
		});
	}
}
