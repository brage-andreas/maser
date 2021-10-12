import type { Command, CommandInteraction } from "../typings.js";

export default class CommandManager {
	public interaction: CommandInteraction | null;
	public command: Command | null;

	constructor(interaction?: CommandInteraction | null, data?: Command | null) {
		this.interaction = interaction ?? null;
		this.command = data ?? null;
	}

	public setCommand(interaction: CommandInteraction | null, data: Command | null): this {
		this.interaction = interaction;
		this.command = data;
		return this;
	}

	/**
	 * See if this command is private or not.
	 */
	public get isPrivate(): boolean {
		this.checkCommand();
		return this.command!.priv ?? false;
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
	public get logLevel(): 2 | 1 | 0 {
		this.checkCommand();
		return this.command!.logLevel ?? 1;
	}

	/**
	 * Whether this command should be hidden or not.
	 */
	public get hidden(): boolean {
		this.checkCommand();
		const standard = this.command!.defaultHide ?? true;
		const option = this.interaction!.options.getBoolean("hide");

		return option ?? standard;
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
	private checkCommand() {
		if (!this.command) throw new Error("commandData must be set to the CommandManager");
		if (!this.interaction) throw new Error("command must be set to the CommandManager");
	}
}
