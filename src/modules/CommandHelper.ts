import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction
} from "discord.js";
import type Logger from "../loggers/index.js";
import { type Command, type LogLevels } from "../typings/index.js";

/**
 * Manages helper functions for a command.
 */
export default class CommandHelper {
	public command!: Readonly<Command>;
	public interaction!:
		| AutocompleteInteraction<"cached">
		| ChatInputCommandInteraction<"cached">;

	/**
	 * Creates a command helper.
	 * @param interaction The interaction to create helpers for.
	 * @constructor
	 */
	public constructor(
		interaction:
			| AutocompleteInteraction<"cached">
			| ChatInputCommandInteraction<"cached">
	) {
		this.setCommand(interaction);
	}

	/**
	 * If this command is private.
	 */
	public get isPrivate(): boolean {
		return this.command.options.private;
	}

	/**
	 * If this command is work-in-progress.
	 */
	public get isWIP(): boolean {
		return this.command.options.wip;
	}

	/**
	 * The log level of this command.
	 * Used internally by CommandLogger.
	 * Default is "normal".
	 *
	 * full   --> command string + console output
	 *
	 * normal --> command string
	 *
	 * none   --> nothing
	 */
	public get logLevel(): LogLevels {
		return this.command.options.logLevel;
	}

	/**
	 * If this command is hidden.
	 */
	public get isHidden(): boolean {
		const standard = this.command.options.defaultHide;
		const option = this.interaction.options.getBoolean("hide");

		return option ?? standard;
	}

	/**
	 * Sets the command for the helper.
	 * @param interaction The interaction to use.
	 */
	public setCommand(
		interaction:
			| AutocompleteInteraction<"cached">
			| ChatInputCommandInteraction<"cached">
	): this {
		this.interaction = interaction;

		this.command = interaction.client.commandHandler.getData(
			interaction.commandName
		);

		return this;
	}

	/**
	 * Shorthand for executing the command.
	 */
	public execute(logger: Logger): void {
		this.command.execute(this.interaction, logger);
	}
}
