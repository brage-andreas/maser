<p align="center">
    <a href="https://en.wikipedia.org/wiki/Maser">
        <img src="https://i.imgur.com/p0GGPVZ.png" />
    </a>
</p>

Note: This is a personal project—please do not engage in the development with PR's and issues.

<br />

# Maser
A Discord bot made with discord.js version 13.

![Image of terminal](https://i.imgur.com/6e9wm50.png)

## How to deploy commands
1. Fill `CLIENT_ID` and/or `GUILD_ID` keys in `.env` file.
	If no `GUILD_ID` is present, it will deploy commands globally.
2. Run `npm run build` or `npm run clear`

The `/build` command can do this from inside Discord, which you can use once you have deployed it.

## Notable features
* Loggers, both in console and in Discord
* Hide option on all commands
* Manager classes make tasks easy to do
* Private — only logs successful actions
* Good command UI and UX

## Example command file
```ts
// root/commands/category/command.ts
import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";

import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

// These are the default options. You can omit this.
const options = {
	defaultHide: true,
	logLevel: 1,
	private: false,
	wip: false
}

const data: ChatInputApplicationCommandData = {
	name: "command",
	description: "Description",
	options: [
		{
			name: "option",
			description: "Option",
			type: ApplicationCommandOptionTypes.STRING
		}
	]
};

async function execute(intr: CommandInteraction) {
	// Command here
	intr.logger.log("Command used");
}

export const getCommand = () => ({ data, options, execute } as Partial<Command>);
```

## Example event
```ts
// root/events/event.ts
import { Client } from "../extensions/";

// For messageUpdate it would be:
//   execute(client: Client, oldMessage: Message, newMessage: Message)
export async function execute(client: Client, info: string) {
	// Warn event
	client.events.logger
		.setEvent("warn")
		.log(info);
}
```


<br /> <br />


![Work in progress](https://i.imgur.com/eS4Md4Q.png)
> \* This applies to both the bot and this README

Made by drango#2399.
