import type { Clint } from "./Clint";

/**
 * Manages emojis for the client.
 */
export class EmojiManager {
	public client: Clint;

	/**
	 * Creates an emoji manager.
	 */
	constructor(client: Clint) {
		this.client = client;
	}

	/**
	 * Searches for all emojis provided. If none is found, returns null.
	 * If one is found, returns the parsed emoji.
	 * Else it will return and array of the parsed emojis found.
	 */
	public findAll(...emojis: string[]): string[] | string | null {
		const emojiArray: string[] = [];

		emojis.forEach((emojiName) => {
			const emoji = this._get(emojiName);
			if (emoji) emojiArray.push(emoji);
		});

		if (emojiArray.length === 0) return null;
		else if (emojiArray.length === 1) return emojiArray[0];
		else return emojiArray;
	}

	/**
	 * Searches for an emoji, and returns it if found.
	 */
	public find(emojiName: string): string | null {
		return this._get(emojiName);
	}

	/**
	 * Gets an emoji from the client cache with a given name.
	 */
	private _get(emojiName: string) {
		const emojis = this.client.emojis.cache;
		const emoji = emojis.find((emoji) => emoji.name?.startsWith(emojiName.toLowerCase()) ?? false);

		return emoji?.toString() ?? null;
	}
}
