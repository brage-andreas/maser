import "discord.js";
import type CommandHandler from "../modules/CommandHandler.js";
import type CommandHelper from "../modules/CommandHelper.js";
import type EventManager from "../modules/EventManager.js";

declare module "discord.js" {
	interface Client {
		commandHandler: CommandHandler;
		eventHandler: EventManager;
	}

	interface CommandInteraction {
		client: Client<true>;
		commandOptions: CommandHelper;
	}

	interface AutocompleteInteraction {
		client: Client<true>;
		commandOptions: CommandHelper;
	}
}
