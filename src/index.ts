import { Client } from "./extensions/";
import dotenv from "dotenv";
dotenv.config();

// clears console
// console.clear() does not fully clear
process.stdout.write("\x1Bc");

const client = new Client();

await client.commands.init();
await client.events.init();

client.login(process.env.TOKEN);

/*
 TODO: util command for creating muted role
 TODO: commands
	- purge
	- lockdown
	- kick ban/hackban softban
	- mute
	- channel info
	- role info
 TODO: more emojis
    - cancelled
    - broke
    - you
    - me
    - owner
    - permissions
*/
