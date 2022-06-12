import "discord.js";
import type { EMOJIS } from "../constants/emojis.js";
import type { COLORS } from "../constants/index.js";
import type { CommandLogger, InfoLogger } from "../logger/index.js";
import type CommandHandler from "../modules/CommandHandler.js";
import type CommandHelper from "../modules/CommandHelper.js";
import type EventManager from "../modules/EventManager.js";

declare module "discord.js" {
	interface Client {
		commandHandler: CommandHandler;
		maserEmojis: typeof EMOJIS;
		colors: typeof COLORS;
		events: EventManager;
		logger: InfoLogger;
	}

	interface CommandInteraction {
		commandOptions: CommandHelper;
		client: Client<true>;
		logger: CommandLogger;
	}

	interface AutocompleteInteraction {
		commandOptions: CommandHelper;
		client: Client<true>;
		logger: CommandLogger;
	}
}
