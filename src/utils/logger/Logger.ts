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
		const base = this._addBase(type, name);
		const trace = this._addTrace();

		process.stdout.write(base);
		if (trace) process.stdout.write(gray(" > ") + trace);
		process.stdout.write("\n");

		const msgs = this.parse(...messages);
		if (msgs?.length) {
			msgs?.forEach((message) => void console.log(message));
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

		return Util.Parse(`${nameStr} ${timeStr}`) as string;
	}

	private _addTrace() {
		const cache = this.traceValues.get();
		let trace = [];

		if (this.traceValues.has("USER")) {
			trace.push(cache.user ? `${cache.user} ${gray(`(u: ${cache.userId})`)}` : `u: ${cache.userId}`);
		}

		if (this.traceValues.has("CHANNEL")) {
			trace.push(`${gray("in")} #${cache.channel}`);
		}

		if (this.traceValues.has("GUILD")) {
			trace.push(`${gray("in")} ${cache.guild}`);
		}

		return trace.join(" ");
	}
}
