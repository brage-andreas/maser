import type { CmdIntr, Command } from "../Typings.js";

import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { readdirSync } from "fs";
import { ID_REGEX } from "../Constants.js";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import Util from "../utils/index.js";

const COMMAND_DIR = new URL("../commands", import.meta.url);

export class CommandManager {
	private _commands: Map<string, Command>;

	constructor() {
		this._commands = new Map();
	}

	public async init() {
		const folders = this._readDir(COMMAND_DIR);
		this._commands = await this._getCommands(folders);
	}

	public execute(intr: CmdIntr) {
		this._commands.get(intr.commandName)?.execute(intr);
	}

	public defaultHide(intr: CmdIntr | string) {
		if (typeof intr !== "string") {
			const commandOption = intr.options.getBoolean("hide");
			const standard = this._commands.get(intr.commandName)?.defaultHide ?? true;

			return commandOption ?? standard;
		} else {
			return this._commands.get(intr)?.defaultHide ?? true;
		}
	}

	public put(clientId: string, guildId?: string) {
		this._put(clientId, guildId);
	}

	public clear(clientId: string, guildId?: string) {
		this._put(clientId, guildId, true);
	}

	private _readDir(dir: URL) {
		return readdirSync(dir);
	}

	private async _getCommands(folders: string[]) {
		const hash: Map<string, Command> = new Map();
		for (let folder of folders) {
			const FOLDER_DIR = new URL(`../commands/${folder}`, import.meta.url);

			const files = this._readDir(FOLDER_DIR);
			for (let fileName of files) {
				const command = (await import(`../commands/${folder}/${fileName}`)) as Command;
				const name = fileName.split(".")[0];
				hash.set(name, command);
			}
		}
		return hash;
	}

	private _getData() {
		return [...this._commands.values()].map((cmd) => {
			if (cmd.data.type && cmd.data.type !== "CHAT_INPUT") return cmd.data;

			cmd.data.options ??= [];
			if (!cmd.data.options.some((option) => option.name === "hide")) {
				const hide = this.defaultHide(cmd.data.name);
				const hideOption = {
					name: "hide",
					description: `Hide the output. Default is ${hide}`,
					type: ApplicationCommandOptionType.Boolean as number
				};

				cmd.data.options.push(hideOption);
			}

			return cmd.data;
		});
	}

	private async _put(clientId: string, guildId?: string, clear = false) {
		if (!process.env.TOKEN) {
			return Util.Log("Token not defined in .env file");
		}

		if (!ID_REGEX.test(clientId)) {
			return Util.Log(`Client id is faulty: ${clientId}`);
		}

		if (guildId && !ID_REGEX.test(guildId)) {
			return Util.Log(`Guild id is faulty: ${clientId}`);
		}

		clientId = clientId as `${bigint}`;
		guildId = guildId as `${bigint}` | undefined;

		const data = this._getData();
		const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

		try {
			const route = guildId
				? Routes.applicationGuildCommands(clientId, guildId)
				: Routes.applicationCommands(clientId);

			const options = { body: clear ? [] : data };

			const res = await rest
				.put(route, options)
				.then(() => `${clear ? "Cleared" : "Set"} commands in guild: ${guildId}`);

			Util.Log(res);
		} catch (e) {
			Util.Log(e.stack ?? e.message ?? e.toString());
		}
	}
}
