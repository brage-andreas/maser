import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import {
	ApplicationCommandOptionType,
	type ApplicationCommandData,
	type ApplicationCommandOptionData,
	type ApplicationCommandSubCommandData,
	type ApplicationCommandSubGroupData,
	type ChatInputCommandInteraction
} from "discord.js";
import { readdirSync } from "fs";
import { REGEXP } from "../constants/index.js";
import { ErrorLogger, InfoLogger } from "../loggers/index.js";
import { type Command, type CommandModule } from "../typings/index.js";

type CommandMap = Map<string, Command>;
const COMMAND_DIR = new URL("../commands", import.meta.url);

/**
 * Handles commands for the client.
 */
export default class CommandHandler {
	private commands: CommandMap = new Map();

	/**
	 * Initialises the handler by loading commands.
	 */
	public async init(): Promise<void> {
		this.commands = await this.getCommands();
	}

	/**
	 * Publishes the commands to Discord.
	 * @param clientId ID of the client.
	 * @param guildId ID of the guild.
	 * @returns `true` if successful, `false` if unsuccessful.
	 */
	public async set(clientId: string, guildId?: string): Promise<boolean> {
		return await this.publish({
			clientId,
			guildId,
			clear: false
		});
	}

	/**
	 * Unpublishes the commands from Discord.
	 * @param clientId ID of the client.
	 * @param guildId ID of the guild.
	 * @returns `true` if successful, `false` if unsuccessful.
	 */
	public async clear(clientId: string, guildId?: string): Promise<boolean> {
		return await this.publish({
			clientId,
			guildId,
			clear: true
		});
	}

	/**
	 * If this interaction or command should be ephemeral.
	 * @param interactionOrCommandName Interaction object or name of command.
	 * @returns If this interaction should be ephemeral.
	 */
	public isHidden(
		interactionOrCommandName: ChatInputCommandInteraction<"cached"> | string
	): boolean {
		if (typeof interactionOrCommandName === "string") {
			return this.getData(interactionOrCommandName).options.defaultHide;
		}

		const intr = interactionOrCommandName;
		const commandOption = intr.options.getBoolean("hide");
		const standard = this.getData(intr.commandName).options.defaultHide;

		return commandOption ?? standard;
	}

	/**
	 * Gets the data of a command.
	 * @param commandName Name of the command.
	 * @returnsThe data of the command.
	 */
	public getData(commandName: string): Command {
		const data = this.commands.get(commandName);

		// This should never be undefined
		if (!data) {
			throw new Error(
				`No internal command found with name: ${commandName}`
			);
		}

		return data;
	}

	/**
	 * Retrieves all commands.
	 * @returns A map of all commands keyed by their respective names.
	 */
	private async getCommands(): Promise<CommandMap> {
		const map: CommandMap = new Map();

		for (const folder of readdirSync(COMMAND_DIR)) {
			const FOLDER_DIR = new URL(
				`../commands/${folder}`,
				import.meta.url
			);

			const fileNames: Array<string> = readdirSync(FOLDER_DIR).filter(
				(fileName) =>
					fileName.toLowerCase().endsWith(".js") &&
					!fileName.toLowerCase().startsWith("noread.")
			);

			for (const fileName of fileNames) {
				const commandModule = (await import(
					`../commands/${folder}/${fileName}`
				)) as CommandModule;

				const partialCommand = commandModule.getCommand();

				if (!partialCommand.data || !partialCommand.execute) {
					throw new Error(
						`File "/commands/${folder}/${fileName}" is missing command properties`
					);
				}

				if (!partialCommand.options) {
					partialCommand.options = {
						defaultHide: true,
						logLevel: "normal",
						private: false,
						wip: false
					};
				} else {
					partialCommand.options.defaultHide ??= true;
					partialCommand.options.logLevel ??= "normal";
					partialCommand.options.private ??= false;
					partialCommand.options.wip ??= false;
				}

				const command = partialCommand as Command;

				map.set(command.data.name, command);
			}
		}

		return map;
	}

	/**
	 * Adds a hide option to an array of options, if a hide options does not already exist.
	 * @param commandOptions An array of the command's options.
	 * @param commandName The name of the command.
	 * @returns The new command's options
	 */
	private addHideOption(
		commandOptions: Array<ApplicationCommandOptionData>,
		commandName: string
	): Array<ApplicationCommandOptionData> {
		if (commandOptions.some((option) => option.name === "hide")) {
			return commandOptions;
		}

		const defaultHide = this.isHidden(commandName);

		const hideOption: ApplicationCommandOptionData = {
			name: "hide",
			description: `Hide the response (${defaultHide})`,
			type: ApplicationCommandOptionType.Boolean
		};

		commandOptions.push(hideOption);

		return commandOptions;
	}

	/**
	 * Gets the data of all loaded commands, and adds a hide option to all of them.
	 * @returns The command data of all loaded commands.
	 */
	private getRawData(): Array<ApplicationCommandData> {
		// Using a set to stop command duplication
		const dataSet: Set<ApplicationCommandData> = new Set();
		const commands = [...this.commands.values()];

		commands.forEach((cmd) => {
			cmd.data.options ??= [];

			const subcommandGroups = cmd.data.options.filter(
				(option) =>
					option.type === ApplicationCommandOptionType.SubcommandGroup
			) as Array<ApplicationCommandSubGroupData>;

			const subcommands = cmd.data.options.filter(
				(option) =>
					option.type === ApplicationCommandOptionType.Subcommand
			) as Array<ApplicationCommandSubCommandData>;

			subcommandGroups.forEach((subgroup) => {
				subgroup.options?.forEach((sub) => {
					// @ts-expect-error TODO: fix type error
					sub.options = this.addHideOption(
						sub.options ?? [],
						cmd.data.name
					);
				});
			});

			subcommands.forEach((sub) => {
				// @ts-expect-error TODO: fix type error
				sub.options = this.addHideOption(
					sub.options ?? [],
					cmd.data.name
				);
			});

			if (!subcommandGroups.length && !subcommands.length) {
				cmd.data.options = this.addHideOption(
					cmd.data.options,
					cmd.data.name
				);
			}

			dataSet.add(cmd.data);
		});

		return [...dataSet];
	}

	/**
	 * Publishes or removes the loaded commands to/from Discord.
	 * @param options The options needed to publish/clear commands.
	 * @returns `true` if successful, `false` if unsuccessful.
	 */
	private async publish(options: {
		clientId: string;
		guildId?: string;
		clear: boolean;
	}): Promise<boolean> {
		const { clientId, guildId, clear } = options;
		const errorLogger = new ErrorLogger();
		const infoLogger = new InfoLogger();

		if (!process.env.BOT_TOKEN) {
			errorLogger.log("Token not defined in .env file");

			return false;
		}

		if (!REGEXP.ID.test(clientId)) {
			errorLogger.log(`Client ID is faulty: ${clientId}`);

			return false;
		}

		if (guildId && !REGEXP.ID.test(guildId)) {
			errorLogger.log(`Guild ID is faulty: ${guildId}`);

			return false;
		}

		const data = this.getRawData();
		const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

		try {
			const route = guildId
				? Routes.applicationGuildCommands(clientId, guildId)
				: Routes.applicationCommands(clientId);

			const options = { body: clear ? [] : data };
			const clearMsg = clear ? "Cleared" : "Set";

			const logMsg = guildId
				? `${clearMsg} commands in guild: ${guildId}`
				: `${clearMsg} global commands`;

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
