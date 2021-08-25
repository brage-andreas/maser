import { ColorManager, CommandManager, EmojiManager, EventManager } from "./managers.js";
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
