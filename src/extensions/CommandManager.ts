import type { CmdIntr, Command } from "../Typings";
import { readdirSync } from "fs";

const BASE_DIR = new URL("../commands", import.meta.url);

export class CommandManager {
    private _commands: Map<string, Command>

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
            const FOLDER_DIR = new URL(`../commands/${folder}`, import.meta.url);

            const files = this._readDir(FOLDER_DIR)
            for (let fileName of files) {
                const command = (await import(`../commands/${fileName}`)) as Command;
                const name = fileName.split(".")[0];
                hash.set(name, command);
            }
        }
        return hash;
	}
}
