import "discord.js";
import type { EMOJIS } from "../constants/emojis.js";
import type { COLORS } from "../constants/index.js";
import type { CommandLogger, InfoLogger } from "../logger/index.js";
import type {
	CommandHandler,
	CommandManager,
	EventManager
} from "../modules/index.js";

declare module "discord.js" {
	interface Client {
		commandHandler: CommandHandler;
		maserEmojis: typeof EMOJIS;
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
