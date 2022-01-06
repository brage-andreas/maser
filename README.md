## A Discord bot made with discord.js version 13.
<p align="center">
    <a href="https://en.wikipedia.org/wiki/Maser">
        <img src="https://i.imgur.com/p0GGPVZ.png" alt="Logo of Maser" />
    </a>
</p>

---

## How to deploy commands
1. Fill `CLIENT_ID` and/or `GUILD_ID` keys in `.env` file.
	If no `GUILD_ID` is present, it will deploy commands globally.
2. Run `npm run buildCmds` or `npm run clearCmds`

The `/build` command can do this from inside Discord, which you can use once you have deployed it.

## Notable features
* Loggers, both in console and in Discord
* Hide option on all commands
* Manager classes make tasks easy to do
* Private — only logs successful actions
* Good command UI and UX


![Image of Maser's terminal](https://i.imgur.com/6e9wm50.png)

---

## Example command file
```ts
// root/commands/category/myCommand.ts
import { type CommandInteraction, type ChatInputApplicationCommandData } from "discord.js";
import { type Command } from "../../typings/index.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const data: ChatInputApplicationCommandData = {
	name: "useful-command",
	description: "A very useful command",
	options: [
		{
			name: "string-option",
			description: "A string option",
			type: ApplicationCommandOptionTypes.STRING
		}
	]
};

async function execute(intr: CommandInteraction<"cached">) {
	// ...
	
	intr.logger.log("Command used");
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
```

## Example event
```ts
// root/events/myEvent.ts
import { type Client } from "discord.js";

export async function execute(client: Client<true>, info: string) {
	client.events.logger
		.setEvent("warn")
		.log(info);
}
```

---

![Work in progress](https://i.imgur.com/eS4Md4Q.png)

---

<sub>✨ Created and maintained by drango#2399 ✨</sub>
