import { getColor, gray, yellow } from "./LoggerColors.js";
import { TraceValueManager } from "./TraceValueManager.js";
import { LoggerTypes } from "../../Typings.js";
import Util from "../index.js";

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
			msgs.forEach((message) => console.log(message));
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

		const message = Util.Parse(`${nameStr} ${timeStr}`) as string;
		process.stdout.write(message);
	}

	private _addTrace() {
		if (!this.traceValues.any()) return;

		const cache = this.traceValues.get();
		const messages: string[] = [];

		process.stdout.write(gray(" > "));

		if (this.traceValues.has("USER")) {
			if (cache.user) {
				messages.push(`${yellow(cache.user)} ${gray(`(u: ${cache.userId})`)}`);
			} else {
				messages.push(`u: ${yellow(cache.userId!)}`);
			}
		}

		if (this.traceValues.has("CHANNEL")) {
			messages.push(`${gray("in")} #${cache.channel}`);
		}

		if (this.traceValues.has("GUILD")) {
			messages.push(`${gray("in")} ${cache.guild}`);
		}

		process.stdout.write(messages.join(" "));
	}
}
