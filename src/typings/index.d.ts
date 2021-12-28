import type {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	Client,
	CommandInteraction,
	MessageEmbed
} from "discord.js";

/**/

export interface CommandModule {
	getCommand(): Partial<Command>;
}

export interface Command {
	options: CommandOptions;
	data: ChatInputApplicationCommandData;
	execute(interaction: AutocompleteInteraction<"cached"> | CommandInteraction<"cached">): Promise<void> | void;
}

export interface CommandOptions {
	defaultHide: boolean;
	logLevel: 0 | 1 | 2;
	private: boolean;
	wip: boolean;
}

export interface Event {
	execute(client: Client, ...args: unknown[]): Promise<void> | void;
}

export interface EvalOutput {
	embeds: MessageEmbed[];
	output: string;
	type: "error" | "output";
}
