import "discord.js";
import type { COLORS, EMOJIS } from "../constants/index.js";
import type { CommandLogger, InfoLogger } from "../logger/index.js";
import type { CommandHandler, CommandManager, EventManager } from "../modules/index.js";

declare module "discord.js" {
	interface Client {
		commandHandler: CommandHandler;
		systemEmojis: typeof EMOJIS;
		colors: typeof COLORS;
		events: EventManager;
		logger: InfoLogger;
	}

	interface CommandInteraction {
		commandOptions: CommandManager;
		client: Client<true>;
		logger: CommandLogger;
	}

	interface AutocompleteInteraction {
		commandOptions: CommandManager;
		client: Client<true>;
		logger: CommandLogger;
	}
}
