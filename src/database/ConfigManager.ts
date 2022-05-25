import { type Client, type TextBasedChannel } from "discord.js";
import prisma from "./prisma.js";

export default class ConfigManager {
	public readonly prisma = prisma;
	public readonly client: Client<true>;
	public guildId: string;

	public readonly get: Record<
		"botLogChannel" | "memberLogChannel" | "modLogChannel",
		() => Promise<TextBasedChannel | null>
	> = {
		botLogChannel: async () => this._get("botLogChId"),
		memberLogChannel: async () => this._get("memberLogChId"),
		modLogChannel: async () => this._get("modLogChId")
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

	private async _get(key: "botLogChId" | "memberLogChId" | "modLogChId") {
		const chIdObj = await this.prisma.configs
			.findUnique({
				where: {
					guildId: this.guildId
				},
				select: {
					[key]: true
				}
			})
			.then((res: Record<string, string | null> | null) => res?.[key]);

		if (!chIdObj) {
			return null;
		}

		const channel = this.client.channels.cache.get(chIdObj);

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
