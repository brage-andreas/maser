import { ClientOptions, Message, Options } from "discord.js";

import { CommandManager, EventManager, ColorManager, EmojiManager } from "./";
import { InfoLogger } from "../utils/logger/";
import { INTENTS } from "../constants.js";
import { Client } from "discord.js";

export default class Clint extends Client<true> {
	commands: CommandManager;
	events: EventManager;
	colors: ColorManager;
	logger: InfoLogger;
	moji: EmojiManager;

	constructor(options?: ClientOptions) {
		const defaultCacheSettings = {
			...Options.defaultMakeCacheSettings,
			MessageManager: {
				sweepInterval: 120, // 2 min
				sweepFilter: () => (msg: Message) => {
					const age = msg.editedTimestamp ?? msg.createdTimestamp;
					const fromBot = msg.author.bot;
					const now = Date.now();
					return fromBot || now - age > 900_000; // 15 min
				}
			}
		};

		const defaultOptions: ClientOptions = {
			allowedMentions: { repliedUser: false },
			failIfNotExists: false,
			intents: INTENTS,
			makeCache: Options.cacheWithLimits(defaultCacheSettings)
		};

		super(options ?? defaultOptions);

		this.commands = new CommandManager();
		this.events = new EventManager(this);
		this.colors = new ColorManager();
		this.logger = new InfoLogger();
		this.moji = new EmojiManager(this);
	}
}
