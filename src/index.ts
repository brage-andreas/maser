import { Client } from "discord.js";
import dotenv from "dotenv";
import { COLORS, EMOJIS, INTENTS } from "./constants.js";
import { InfoLogger } from "./logger/index.js";
import { CommandHandler, EventManager } from "./modules/index.js";
dotenv.config();

// clears console -- console.clear() does not fully clear it
process.stdout.write("\x1Bc");

const client = new Client<true>({
	allowedMentions: { repliedUser: false, parse: [] },
	intents: INTENTS
});

client.commandHandler = new CommandHandler();
client.systemEmojis = EMOJIS;
client.events = new EventManager(client);
client.logger = new InfoLogger();
client.colors = COLORS;

await client.commandHandler.init();
await client.events.init();

client.login(process.env.BOT_TOKEN);
