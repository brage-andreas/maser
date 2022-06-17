import { type APIEmbed } from "discord-api-types/v9";
import type {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	CommandInteraction
} from "discord.js";
import type Logger from "../loggers/index.js";

export type Colour =
	| "black"
	| "blue"
	| "green"
	| "grey"
	| "red"
	| "white"
	| "yellow";
export type LogLevels = "full" | "none" | "normal";

export interface CommandModule {
	getCommand(): Partial<Command>;
}

export interface Command {
	data: ChatInputApplicationCommandData;
	options: CommandOptions;
	execute(
		interaction:
			| AutocompleteInteraction<"cached">
			| CommandInteraction<"cached">,
		logger: Logger
	): Promise<unknown> | unknown;
}

export interface CommandOptions {
	defaultHide: boolean;
	private: boolean;
	wip: boolean;
}

export interface Event {
	execute(...args: Array<unknown>): Promise<unknown> | unknown;
}

export interface EvalOutput {
	embeds: Array<APIEmbed>;
	output: string;
	type: "error" | "output";
}
