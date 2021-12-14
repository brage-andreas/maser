import "discord.js";

import type { CommandHandler, EventManager, CommandManager } from "../modules/index.js";
import type { InfoLogger, CommandLogger } from "../logger/index.js";
import type { EMOJIS, COLORS } from "../constants.js";

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
