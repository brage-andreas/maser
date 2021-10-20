import type {
	ApplicationCommandChannelOptionData,
	ApplicationCommandChoicesData,
	ApplicationCommandData,
	ApplicationCommandNonOptionsData,
	ApplicationCommandOptionData,
	ApplicationCommandSubCommandData,
	ApplicationCommandSubGroupData
} from "discord.js";
import type { CommandInteraction, Command, CommandModule } from "../typings.js";

import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { ErrorLogger, InfoLogger } from "../utils/logger";
import { readdirSync } from "fs";
import { Routes } from "discord-api-types/v9";
import { REGEX } from "../constants.js";
import { REST } from "@discordjs/rest";

const COMMAND_DIR = new URL("../commands", import.meta.url);

const SUBGROUP_TYPE = ApplicationCommandOptionType.SubcommandGroup as number;
const SUB_TYPE = ApplicationCommandOptionType.Subcommand as number;

// TODO: fix this mess
type SubInGroupOption =
	| ApplicationCommandNonOptionsData
	| ApplicationCommandChannelOptionData
	| ApplicationCommandChoicesData;

type SubOption = ApplicationCommandOptionData;

/**
 * Manages commands for the client.
 */
export default class CommandHandler {
	private _commands: Map<string, Command>;

	/**
	 * Creates a command manager.
	 */
	constructor() {
		this._commands = new Map();
	}

	/**
	 * Initialises the class by loading commands internally.
	 */
	public async init(): Promise<void> {
		const folders = this._readDir(COMMAND_DIR);
		this._commands = await this._getCommands(folders);
	}

	/**
	 * Sets global (client) or guild commands in Discord.
	 */
	public async put(clientId: string, guildId?: string): Promise<boolean> {
		return await this._put(clientId, guildId);
	}

	/**
	 * Clears global (client) or guild commands in Discord.
	 */
	public async clear(clientId: string, guildId?: string): Promise<boolean> {
		return await this._put(clientId, guildId, true);
	}

	/**
	 * Get a command's data.
	 */
	public get(command: CommandInteraction | string): Command {
		const name = typeof command === "string" ? command : command.commandName;
		return this._get(name);
	}

	/**
	 * Short-hand for getting a command's data. Ensures it is available.
	 */
	private _get(key: string): Command {
		const data = this._commands.get(key);

		// data should never be undefined here
		if (!data) throw new Error(`No internal command found with name: ${key}`);
		return data;
	}

	/**
	 * Reads and returns a directory for files with a given URL.
	 */
	private _readDir(dir: URL): string[] {
		return readdirSync(dir);
	}

	/**
	 * Returns a map of all commands in given folders mapped by their names.
	 */
	private async _getCommands(folders: string[]): Promise<Map<string, Command>> {
		const hash: Map<string, Command> = new Map();

		for (let folder of folders) {
			const FOLDER_DIR = new URL(`../commands/${folder}`, import.meta.url);
			const files = this._readDir(FOLDER_DIR).filter((f) => f.toLowerCase().endsWith(".js"));

			for (let fileName of files) {
				const commandModule = (await import(`../commands/${folder}/${fileName}`)) as CommandModule;
				const partialCommand = commandModule.getCommand();

				const name = fileName.split(".")[0];

				if (!partialCommand.data || !partialCommand.execute) {
					throw new Error(`File "/commands/${folder}/${fileName}" is missing command properties`);
				}

				partialCommand.options ??= {};

				const command = partialCommand as Command;

				command.options.defaultHide ??= true;
				command.options.logLevel ??= 1;
				command.options.private ??= false;
				command.options.wip ??= false;

				hash.set(name, command);
			}
		}

		return hash;
	}

	/**
	 * Gets the default hide option of this command.
	 */
	public getDefaultHide(intr: CommandInteraction | string): boolean {
		if (typeof intr !== "string") {
			const commandOption = intr.options.getBoolean("hide");
			const standard = this._get(intr.commandName).options.defaultHide ?? true;

			return commandOption ?? standard;
		} else {
			return this._get(intr).options.defaultHide ?? true;
		}
	}

	/**
	 * Adds a "hide" option to the given option array, if none present.
	 */
	private _addHideOption<T extends SubInGroupOption | SubOption>(options: T[], name: string): T[] {
		if (!options.some((option) => option.name === "hide")) {
			const hide = this.getDefaultHide(name);
			const hideOption = {
				name: "hide",
				description: `Hide the response. Default is ${hide}`,
				type: ApplicationCommandOptionType.Boolean as number
			} as T;

			options.push(hideOption);
		}

		return options;
	}

	/**
	 * Returns an array of all the cached commands' data.
	 * Ensures a "hide" option in all chat-input commands.
	 */
	private _getData(): ApplicationCommandData[] {
		return [...this._commands.values()].map((cmd) => {
			if (cmd.data.type && cmd.data.type !== "CHAT_INPUT") return cmd.data;

			cmd.data.options ??= [];

			const subcommandGroups = cmd.data.options.filter(
				(option) => option.type === SUBGROUP_TYPE
			) as ApplicationCommandSubGroupData[];

			const subcommands = cmd.data.options.filter(
				(option) => option.type === SUB_TYPE
			) as ApplicationCommandSubCommandData[];

			// TODO: find out how to properly type this
			// At least it doesn't error now
			// but i truly cannot figure this out
			subcommandGroups.forEach((subgroup) => {
				subgroup.options?.forEach((subcommand) => {
					subcommand.options = this._addHideOption(subcommand.options ?? [], cmd.data.name);
				});
			});

			subcommands.forEach((sub) => {
				sub.options = this._addHideOption(sub.options ?? [], cmd.data.name);
			});

			if (!subcommandGroups.length && !subcommands.length) {
				cmd.data.options = this._addHideOption(cmd.data.options, cmd.data.name);
			}

			return cmd.data;
		});
	}

	/**
	 * Sets cached commands in Discord.
	 * Returns true if it succeeded, and false if it failed.
	 */
	private async _put(clientId: string, guildId?: string, clear: boolean = false): Promise<boolean> {
		const errorLogger = new ErrorLogger();
		const infoLogger = new InfoLogger();

		if (!process.env.TOKEN) {
			errorLogger.log("Token not defined in .env file");
			return false;
		}

		if (!REGEX.ID.test(clientId)) {
			errorLogger.log(`Client id is faulty: ${clientId}`);
			return false;
		}

		if (guildId && !REGEX.ID.test(guildId)) {
			errorLogger.log(`Guild id is faulty: ${guildId}`);
			return false;
		}

		const data = this._getData();
		const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

		try {
			const route = guildId
				? Routes.applicationGuildCommands(clientId, guildId)
				: Routes.applicationCommands(clientId);

			const options = { body: clear ? [] : data };

			const clearMsg = clear ? "Cleared" : "Set";
			const logMsg = guildId ? `${clearMsg} commands in guild: ${guildId}` : `${clearMsg} global commands`;

			const res = await rest
				.put(route, options)
				.then(() => logMsg)
				.catch((err) => {
					const error = err as Error; // stupid
					errorLogger.log(error.stack ?? error.message);

					return null;
				});

			if (res) {
				infoLogger.log(res);
				return true;
			} else {
				return false;
			}
		} catch (err) {
			const error = err as Error; // stupid
			errorLogger.log(error.stack ?? error.message);

			return false;
		}
	}
}
