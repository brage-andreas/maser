import type {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	Client,
	CommandInteraction,
	MessageEmbed
} from "discord.js";

/**/

export interface CommandModule {
	getCommand: () => Partial<Command>;
}

export interface Command {
	execute: (interaction: CommandInteraction<"cached"> | AutocompleteInteraction<"cached">) => Promise<void> | void;
	options: CommandOptions;
	data: ChatInputApplicationCommandData;
}

export interface CommandOptions {
	defaultHide: boolean;
	logLevel: 2 | 1 | 0;
	private: boolean;
	wip: boolean;
}

export interface Event {
	execute: (client: Client, ...args: unknown[]) => Promise<void> | void;
}

export interface EvalOutput {
	embeds: MessageEmbed[];
	output: string;
	type: "output" | "error";
}
