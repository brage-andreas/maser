import { CommandManager } from "./CommandManager.js";
import { EventManager } from "./EventManager.js";
import { ColorManager } from "./ColorManager.js";
import { EmojiManager } from "./EmojiManager.js";
import { INTENTS } from "../Constants.js";
import { Client } from "discord.js";

export class Clint extends Client {
	commands: CommandManager;
	events: EventManager;
	colors: ColorManager;
	moji: EmojiManager;

	constructor() {
		super({
			allowedMentions: { repliedUser: false },
			intents: INTENTS
		});

		this.commands = new CommandManager();
		this.events = new EventManager(this);
		this.colors = new ColorManager();
		this.moji = new EmojiManager(this);
	}
}
