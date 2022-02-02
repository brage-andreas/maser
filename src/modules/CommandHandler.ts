import { REST } from "@discordjs/rest";
import { ApplicationCommandOptionType, Routes } from "discord-api-types/v9";
import {
	type ApplicationCommandChannelOptionData,
	type ApplicationCommandChoicesData,
	type ApplicationCommandData,
	type ApplicationCommandNonOptionsData,
	type ApplicationCommandOptionData,
	type ApplicationCommandSubCommandData,
	type ApplicationCommandSubGroupData,
	type ChatInputCommandInteraction
} from "discord.js";
import { readdirSync } from "fs";
import { REGEXP } from "../constants/index.js";
import { ErrorLogger, InfoLogger } from "../logger/index.js";
import { type Command, type CommandModule } from "../typings/index.js";

const COMMAND_DIR = new URL("../commands", import.meta.url);
const SUBGROUP_TYPE = ApplicationCommandOptionType.SubcommandGroup;
const SUB_TYPE = ApplicationCommandOptionType.Subcommand;

type SubInGroupOption =
	| ApplicationCommandChannelOptionData
	| ApplicationCommandChoicesData
	| ApplicationCommandNonOptionsData;

type SubOption = ApplicationCommandOptionData;

/**
 * Manages commands for the client.
 */
export default class CommandHandler {
	private _commands: Map<string, Command>;

	/**
	 * Creates a command manager.
	 */
	public constructor() {
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
	public getData(command: string): Command {
		return this._get(command);
	}

	/**
	 * Gets the default hide option of this command.
	 */
	public getDefaultHide(intr: ChatInputCommandInteraction<"cached"> | string): boolean {
		if (typeof intr !== "string") {
			const commandOption = intr.options.getBoolean("hide");
			const standard = this._get(intr.commandName).options.defaultHide;

			return commandOption ?? standard;
		}

		return this._get(intr).options.defaultHide;
	}

	/**
	 * Short-hand for getting a command's data. Ensures it is available.
	 */
	private _get(key: string): Command {
		const data = this._commands.get(key);

		// This should never be undefined
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

		for (const folder of folders) {
			const FOLDER_DIR = new URL(`../commands/${folder}`, import.meta.url);

			const files = this._readDir(FOLDER_DIR).filter(
				(fileName) => fileName.toLowerCase().endsWith(".js") && !fileName.toLowerCase().startsWith("noread.")
			);

			for (const fileName of files) {
				const commandModule = (await import(`../commands/${folder}/${fileName}`)) as CommandModule;
				const partialCommand = commandModule.getCommand();

				if (!partialCommand.data || !partialCommand.execute)
					throw new Error(`File "/commands/${folder}/${fileName}" is missing command properties`);

				if (!partialCommand.options) {
					partialCommand.options = {
						defaultHide: true,
						logLevel: 1,
						private: false,
						wip: false
					};
				} else {
					partialCommand.options.defaultHide ??= true;

					partialCommand.options.logLevel ??= 1;

					partialCommand.options.private ??= false;

					partialCommand.options.wip ??= false;
				}

				const command = partialCommand as Command;

				hash.set(command.data.name, command);
			}
		}

		return hash;
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
				type: ApplicationCommandOptionType.Boolean
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
		const dataSet: Set<ApplicationCommandData> = new Set();
		const commands = [...this._commands.values()];

		commands.forEach((cmd) => {
			cmd.data.options ??= [];

			const subcommandGroups = cmd.data.options.filter(
				(option) => option.type === SUBGROUP_TYPE
			) as ApplicationCommandSubGroupData[];

			const subcommands = cmd.data.options.filter(
				(option) => option.type === SUB_TYPE
			) as ApplicationCommandSubCommandData[];

			subcommandGroups.forEach((subgroup) => {
				subgroup.options?.forEach((subcommand) => {
					subcommand.options = this._addHideOption(subcommand.options ?? [], cmd.data.name);
				});
			});

			subcommands.forEach((sub) => {
				sub.options = this._addHideOption(sub.options ?? [], cmd.data.name);
			});

			if (!subcommandGroups.length && !subcommands.length)
				cmd.data.options = this._addHideOption(cmd.data.options, cmd.data.name);

			dataSet.add(cmd.data);
		});

		return [...dataSet];
	}

	/**
	 * Sets cached commands in Discord.
	 * Returns true if it succeeded, and false if it failed.
	 */
	private async _put(clientId: string, guildId?: string, clear = false): Promise<boolean> {
		const errorLogger = new ErrorLogger();
		const infoLogger = new InfoLogger();

		if (!process.env.BOT_TOKEN) {
			errorLogger.log("Token not defined in .env file");

			return false;
		}

		if (!REGEXP.ID.test(clientId)) {
			errorLogger.log(`Client id is faulty: ${clientId}`);

			return false;
		}

		if (guildId && !REGEXP.ID.test(guildId)) {
			errorLogger.log(`Guild id is faulty: ${guildId}`);

			return false;
		}

		const data = this._getData();
		const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

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
			}

			return false;
		} catch (err: unknown) {
			const error = err as Error; // stupid

			errorLogger.log(error.stack ?? error.message);

			return false;
		}
	}
}
