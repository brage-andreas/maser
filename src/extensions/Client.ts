import type { ClientOptions } from "discord.js";
import { CommandHandler, EventManager, ColorManager, EmojiManager } from "./";
import { InfoLogger } from "../utils/logger";
import { INTENTS } from "../constants.js";
import Discord from "discord.js";

export default class Client extends Discord.Client<true> {
	commands: CommandHandler;
	events: EventManager;
	colors: ColorManager;
	logger: InfoLogger;
	moji: EmojiManager;

	constructor(options?: ClientOptions) {
		const defaultCacheSettings = {
			...Discord.Options.defaultMakeCacheSettings,
			/*MessageManager: {
				sweepInterval: 120, // 2 min
				sweepFilter: () => (msg: Message) => {
					const age = msg.editedTimestamp ?? msg.createdTimestamp;
					const fromBot = msg.author.bot;
					const now = Date.now();
					return fromBot || now - age > 900_000; // 15 min
				}
			}*/
			MessageManager: 0
		};

		const defaultOptions: ClientOptions = {
			makeCache: Discord.Options.cacheWithLimits(defaultCacheSettings),
			allowedMentions: { repliedUser: false },
			failIfNotExists: false,
			intents: INTENTS
		};

		super(options ?? defaultOptions);

		this.commands = new CommandHandler();
		this.events = new EventManager(this);
		this.colors = new ColorManager();
		this.logger = new InfoLogger();
		this.moji = new EmojiManager(this);
	}
}
