import type { ClientOptions } from "discord.js";
import { CommandManager } from "./CommandManager.js";
import { EventManager } from "./EventManager.js";
import { ColorManager } from "./ColorManager.js";
import { EmojiManager } from "./EmojiManager.js";
import { InfoLogger } from "../utils/logger/InfoLogger.js";
import { INTENTS } from "../constants.js";
import { Client } from "discord.js";

// TODO: module augment instead of monkey patch

export class Clint extends Client<true> {
	commands: CommandManager;
	colors: ColorManager;
	events: EventManager;
	logger: InfoLogger;
	moji: EmojiManager;

	constructor(options?: ClientOptions) {
		const defaultOptions: ClientOptions = {
			allowedMentions: { repliedUser: false },
			intents: INTENTS
		};

		super(options ?? defaultOptions);

		this.commands = new CommandManager();
		this.logger = new InfoLogger();
		this.events = new EventManager(this);
		this.colors = new ColorManager();
		this.moji = new EmojiManager(this);
	}
}
