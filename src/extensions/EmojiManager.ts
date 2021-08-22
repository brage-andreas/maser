import type { GuildEmoji } from "discord.js";
import type { Clint } from "./Clint";

export class EmojiManager {
	public client: Clint;

	constructor(client: Clint) {
		this.client = client;
	}

	public find(...emojis: string[]) {
		const fn = (emoji: GuildEmoji, name: string) => emoji.name?.includes(name.toLowerCase()) ?? false;
		const emojiArray: GuildEmoji[] = [];

		emojis.forEach((emojiName) => {
			const emoji = this.client.emojis.cache.find((emoji) => fn(emoji, emojiName));
			if (emoji) emojiArray.push(emoji);
		});

		if (emojiArray.length === 0) return null;
		else if (emojiArray.length === 1) return emojiArray[0];
		else return emojiArray;
	}
}
