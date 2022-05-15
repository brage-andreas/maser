import { type APIEmbed } from "discord-api-types/v9";
import type {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	Client,
	CommandInteraction
} from "discord.js";

/**/

export type ImageSizes = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

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
	): Promise<void> | void;
}

export interface CommandOptions {
	defaultHide: boolean;
	logLevel: 0 | 1 | 2;
	private: boolean;
	wip: boolean;
}

export interface Event {
	execute(client: Client, ...args: Array<unknown>): Promise<void> | void;
}

export interface EvalOutput {
	embeds: Array<APIEmbed>;
	output: string;
	type: "error" | "output";
}
