import type { Clint } from "./Clint";

export class EmojiManager {
	public client: Clint;

	constructor(client: Clint) {
		this.client = client;
	}

	public findAll(...emojis: string[]) {
		const emojiArray: string[] = [];

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
		const emojis = this.client.emojis.cache;
		const emoji = emojis.find((emoji) => emoji.name?.startsWith(emojiName.toLowerCase()) ?? false);

		return emoji?.toString() ?? null;
	}
}
