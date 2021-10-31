import type { ClientOptions } from "discord.js";
import { CommandHandler, EventManager } from "./";
import { INTENTS, EMOJIS, COLORS } from "../constants.js";
import { InfoLogger } from "../utils/logger";
import CommandManager from "./CommandManager";
import Discord from "discord.js";

export default class Client extends Discord.Client<true> {
	public commands: CommandHandler;
	public command: CommandManager;
	public events: EventManager;
	public logger: InfoLogger;

	public systemEmojis = EMOJIS;
	public colors = COLORS;

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
		this.command = new CommandManager();
		this.events = new EventManager(this);
		this.logger = new InfoLogger();
	}
}
