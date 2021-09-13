import type { ClientOptions } from "discord.js";

import { CommandManager, EventManager, ColorManager, EmojiManager } from "./";
import { InfoLogger } from "../utils/logger/";
import { INTENTS } from "../constants.js";
import { Client } from "discord.js";

export default class Clint extends Client<true> {
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
