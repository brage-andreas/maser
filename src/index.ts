import { Clint } from "./extensions/Clint.js";
import dotenv from "dotenv";

dotenv.config();
process.stdout.write("\x1Bc\n");

const client = new Clint();

await client.commands.init();
await client.events.init();

client.login(process.env.TOKEN);
