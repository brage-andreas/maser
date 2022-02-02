import { type AutocompleteInteraction, type ChatInputCommandInteraction } from "discord.js";
import { type Command } from "../typings/index.js";

export default class CommandManager {
	public interaction: AutocompleteInteraction<"cached"> | ChatInputCommandInteraction<"cached"> | null;
	public command: Readonly<Command> | null;

	public constructor(
		interaction?: AutocompleteInteraction<"cached"> | ChatInputCommandInteraction<"cached"> | null,
		data?: Command | null
	) {
		this.interaction = interaction ?? null;

		this.command = data ?? null;
	}

	/**
	 * See if this command is private or not.
	 */
	public get isPrivate(): boolean {
		this.checkCommand();

		return this.command!.options.private;
	}

	/**
	 * See if this command is work-in-progress or not.
	 */
	public get isWIP(): boolean {
		this.checkCommand();

		return this.command!.options.wip;
	}

	/**
	 * The log level of this command.
	 * Used internally by CommandLogger.
	 * Default is 1.
	 *
	 * 2 - Command string + console output
	 *
	 * 1 - Command string
	 *
	 * 0 - Nothing
	 */
	public get logLevel(): 0 | 1 | 2 {
		this.checkCommand();

		return this.command!.options.logLevel;
	}

	/**
	 * Whether to hide this command.
	 */
	public get hide(): boolean {
		this.checkCommand();

		const standard = this.command!.options.defaultHide;
		const option = this.interaction!.options.getBoolean("hide");

		return option ?? standard;
	}

	public setCommand(
		interaction: AutocompleteInteraction<"cached"> | ChatInputCommandInteraction<"cached"> | null,
		data: Command | null
	): this {
		this.interaction = interaction;

		this.command = data;

		return this;
	}

	/**
	 * Tries to execute a given command.
	 */
	public execute(): void {
		this.checkCommand();

		this.command!.execute(this.interaction!);
	}

	/**
	 * Checks if command is present.
	 */
	private checkCommand(): void {
		if (!this.command) throw new Error("commandData must be set to the CommandManager");

		if (!this.interaction) throw new Error("command must be set to the CommandManager");
	}
}
