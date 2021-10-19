import type { Client } from "./";
import type { Guild, GuildEmoji } from "discord.js";
import { REGEX } from "../constants";

/**
 * Manages emojis for the client.
 */
export default class EmojiManager {
	public guildId: string | null;
	public client: Client;

	/**
	 * Creates an emoji manager. If no id is provided, it will default to `process.env.EMOJI_GUILD_ID` if present.
	 */
	constructor(client: Client, guildId?: string, global?: boolean) {
		if (guildId && !global && !REGEX.ID.test(guildId)) {
			throw new TypeError(`Guild id must be a valid id: ${guildId}`);
		}

		const envGuildId = !global ? process.env.EMOJI_GUILD_ID ?? null : null;

		this.guildId = guildId ?? envGuildId;
		this.client = client;
	}

	/**
	 * Sets or removes the guildId for the manager.
	 */
	public setGuildId(guildId: string | null): this {
		if (guildId && !REGEX.ID.test(guildId)) {
			throw new TypeError(`Guild id must be a valid id: ${guildId}`);
		}

		this.guildId = guildId;
		return this;
	}

	/**
	 * Searches for any emojis, and returns an array of them.
	 */
	public find(...emojiNames: string[]): (string | null)[] {
		const guild = this.client.guilds.cache.get(this.guildId ?? "");
		const base = guild?.emojis.cache ?? this.client.emojis.cache;

		const emojiArray = emojiNames.map((emojiName) => {
			const emoji = base.find((emoji) => emoji.name?.startsWith(emojiName.toLowerCase()) ?? false);
			return emoji?.toString() ?? null;
		});

		return emojiArray;
	}

	/**
	 * Searches for any emojis, and parses and returns an array of them.
	 */
	public findAndParse(...emojiNames: string[]): string[] {
		const emojis = this.find(...emojiNames);

		const parsedEmojiArray = emojis.map((emoji) => (emoji ? emoji + " " : ""));
		return parsedEmojiArray;
	}
}
