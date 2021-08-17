import type { CmdIntr, Command } from "../Typings.js";
import type { Clint } from "./Clint.js";

import { readdirSync } from "fs";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";

import { ID_REGEX } from "../Constants.js";
import Util from "../utils/index.js";

const BASE_DIR = new URL("../commands", import.meta.url);

export class CommandManager {
	private _commands: Map<string, Command>;

	constructor() {
		this._commands = new Map();
	}

	public async init() {
		const folders = this._readDir(BASE_DIR);
		this._commands = await this._getCommands(folders);
	}

	public async execute(intr: CmdIntr) {
		this._commands.get(intr.commandName)?.execute(intr);
	}

	private _readDir(dir: URL) {
		return readdirSync(dir);
	}

	private async _getCommands(folders: string[]) {
		const hash: Map<string, Command> = new Map();
		for (let folder of folders) {
			const FOLDER_DIR = new URL(
				`../commands/${folder}`,
				import.meta.url
			);

			const files = this._readDir(FOLDER_DIR);
			for (let fileName of files) {
				const command = (await import(
					`../commands/${folder}/${fileName}`
				)) as Command;
				const name = fileName.split(".")[0];
				hash.set(name, command);
			}
		}
		return hash;
	}

	private _getData() {
		return [...this._commands.values()].map((cmd) => cmd.data);
	}

	public async put(clientId: string, guildId?: string) {
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

			const options = { body: data };

			const res = await rest
				.put(route, options)
				.then(() => `Set commands in guild: ${guildId}`);

			Util.Log(res);
		} catch (e) {
			Util.Log(e.stack ?? e.message ?? e.toString());
		}
	}
}
