import { Client } from "discord.js";
import "dotenv/config";
import { INTENTS, PARTIALS } from "./constants/index.js";
import { InfoLogger } from "./loggers/index.js";
import CommandHandler from "./modules/CommandHandler.js";
import EventManager from "./modules/EventManager.js";

// clears console -- console.clear() does not fully clear it
process.stdout.write("\x1Bc");

const client = new Client<true>({
	allowedMentions: {
		repliedUser: false,
		parse: []
	},
	intents: INTENTS,
	partials: PARTIALS
});

client.commandHandler = new CommandHandler();
client.eventHandler = new EventManager(client);
client.logger = new InfoLogger();

await client.commandHandler.readyCommands();
await client.eventHandler.readyEvents();

client.login(process.env.BOT_TOKEN);
