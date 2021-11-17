import type { ClientOptions } from "discord.js";

import { CommandHandler, EventManager } from "./index.js";
import { INTENTS, EMOJIS, COLORS } from "../constants.js";
import { InfoLogger } from "../utils/logger/index.js";
import CommandManager from "./CommandManager.js";
import Discord from "discord.js";

export default class Client extends Discord.Client<true> {
	public commands: CommandHandler;
	public command: CommandManager;
	public events: EventManager;
	public logger: InfoLogger;

	public systemEmojis = EMOJIS;
	public colors = COLORS;

	constructor(options?: ClientOptions) {
		const defaultOptions: ClientOptions = {
			allowedMentions: { repliedUser: false, parse: [] },
			failIfNotExists: false,
			intents: INTENTS
		};

		super(options ?? defaultOptions);

		this.commands = new CommandHandler();
		this.command = new CommandManager();
		this.events = new EventManager(this);
		this.logger = new InfoLogger();
	}
}
