import { TraceValueManager } from "./TraceValueManager.js";
import { getColor, gray } from "./LoggerColors.js";
import Util from "../index.js";
import { LoggerTypes } from "../../Typings.js";

export class BaseLogger {
	protected traceValues: TraceValueManager;

	constructor() {
		this.traceValues = new TraceValueManager();
	}

	protected print(type: LoggerTypes, name: string, ...messages: string[]) {
		this._addBase(type, name);
		this._addTrace();

		process.stdout.write("\n");

		const msgs = this.parse(...messages);
		if (msgs && msgs.length) {
			msgs.forEach((message) => void console.log(message));
			process.stdout.write("\n");
		}
	}

	protected parse(...messages: string[]) {
		if (!messages.length) return null;

		return messages.map((message) => {
			const lines = message.split(/[\r\n]/);
			const parseLine = (line: string) => {
				const isIndented = line.startsWith("$>");
				const indent = isIndented ? 8 : 4;
				line = isIndented ? line.slice(2) : line;

				return Util.Parse(line, indent) as string;
			};

			return lines.map(parseLine).join("\n");
		});
	}

	private _addBase(type: LoggerTypes, name: string) {
		const colorFn = getColor(type);
		const timeStr = gray(Util.Now());
		const nameStr = colorFn(`[${name}]`);

		process.stdout.write(Util.Parse(`${nameStr} ${timeStr}`) as string);
	}

	private _addTrace() {
		const cache = this.traceValues.get();

		if (this.traceValues.any()) process.stdout.write(gray(" > "));

		if (this.traceValues.has("USER")) {
			if (cache.user) {
				process.stdout.write(`${cache.user} ${gray(`(u: ${cache.userId})`)}`);
			} else {
				process.stdout.write(`u: ${cache.userId}`);
			}
		}

		if (this.traceValues.has("CHANNEL")) {
			process.stdout.write(`${gray("in")} #${cache.channel}`);
		}

		if (this.traceValues.has("GUILD")) {
			process.stdout.write(`${gray("in")} ${cache.guild}`);
		}
	}
}
