import { Client } from "discord.js";
import "dotenv/config";
import { EMOJIS } from "./constants/emojis.js";
import { COLORS, INTENTS, PARTIALS } from "./constants/index.js";
import { InfoLogger } from "./logger/index.js";
import CommandHandler from "./modules/CommandHandler.js";
import EventManager from "./modules/EventManager.js";

// clears console -- console.clear() does not fully clear it
process.stdout.write("\x1Bc");

const client = new Client<true>({
	allowedMentions: {
		repliedUser: false,
		parse: []
	},
	partials: PARTIALS,
	intents: INTENTS
});

client.commandHandler = new CommandHandler();
client.maserEmojis = EMOJIS;
client.events = new EventManager(client);
client.logger = new InfoLogger();
client.colors = COLORS;

await client.commandHandler.init();
await client.events.init();

client.login(process.env.BOT_TOKEN);
