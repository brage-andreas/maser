import type { ClientColors } from "../Typings.js";

import { COLORS, INTENTS } from "../Constants.js";
import { CommandManager } from "./CommandManager.js";
import { EmojiManager } from "./EmojiManager.js";
import { EventManager } from "./EventManager.js";
import { Client } from "discord.js";

export class Clint extends Client {
	commands: CommandManager;
	events: EventManager;
	colors: ClientColors;
	moji: EmojiManager;

	constructor() {
		super({
			intents: INTENTS,
			allowedMentions: { repliedUser: false }
		});

		this.commands = new CommandManager();
		this.events = new EventManager(this);
		this.moji = new EmojiManager(this);
		this.colors = this._getColors();
	}

	private _getColors() {
		const colorCache: ClientColors = {};
		for (const [key, value] of Object.entries(COLORS)) {
			colorCache[key.toLowerCase()] = `#${value}`;
		}
		return colorCache;
	}
}
