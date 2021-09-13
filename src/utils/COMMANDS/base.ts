import { CommandManager } from "../../extensions/";
import dotenv from "dotenv";
dotenv.config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!clientId) throw new Error("Client id must be set in .env file");

const manager = new CommandManager();
await manager.init();

export { manager, clientId, guildId };
