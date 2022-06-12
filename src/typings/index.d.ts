import { type APIEmbed } from "discord-api-types/v9";
import type {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	Client,
	CommandInteraction
} from "discord.js";

export type LogLevels = "full" | "none" | "normal";

export interface CommandModule {
	getCommand(): Partial<Command>;
}

export interface Command {
	options: CommandOptions;
	data: ChatInputApplicationCommandData;
	execute(
		interaction:
			| AutocompleteInteraction<"cached">
			| CommandInteraction<"cached">
	): Promise<unknown> | unknown;
}

export interface CommandOptions {
	defaultHide: boolean;
	logLevel: LogLevels;
	private: boolean;
	wip: boolean;
}

export interface Event {
	execute(
		client: Client,
		...args: Array<unknown>
	): Promise<unknown> | unknown;
}

export interface EvalOutput {
	embeds: Array<APIEmbed>;
	output: string;
	type: "error" | "output";
}
