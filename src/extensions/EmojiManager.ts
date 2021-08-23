import type { GuildEmoji } from "discord.js";
import type { Clint } from "./Clint";

export class EmojiManager {
	public client: Clint;

	constructor(client: Clint) {
		this.client = client;
	}

	public findAll(...emojis: string[]) {
		const emojiArray: GuildEmoji[] = [];

		emojis.forEach((emojiName) => {
			const emoji = this._get(emojiName);
			if (emoji) emojiArray.push(emoji);
		});

		if (emojiArray.length === 0) return null;
		else if (emojiArray.length === 1) return emojiArray[0];
		else return emojiArray;
	}

	public find(emojiName: string) {
		return this._get(emojiName);
	}

	private _get(emojiName: string) {
		return this.client.emojis.cache.find((emoji) => emoji.name?.includes(emojiName.toLowerCase()) ?? false) ?? null;
	}
}
