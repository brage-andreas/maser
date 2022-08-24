import { type APIEmbed } from "discord-api-types/v9";
import type {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	CommandInteraction,
	ModalSubmitInteraction
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
export type MaserEmojis =
	| "balance"
	| "booster"
	| "bravery"
	| "brilliance"
	| "bughunter1"
	| "bughunter2"
	| "certified_mod"
	| "check"
	| "cross"
	| "earlyDeveloper"
	| "earlyNitro"
	| "hypesquad"
	| "lock"
	| "partner"
	| "sparkles"
	| "staff"
	| "warning"
	| "wip";

export interface CommandModule {
	getCommand(): Partial<Command>;
}

export interface Command {
	data: ChatInputApplicationCommandData;
	options: CommandOptions;
	execute(
		interaction:
			| AutocompleteInteraction<"cached">
			| CommandInteraction<"cached">
			| ModalSubmitInteraction<"cached">,
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
