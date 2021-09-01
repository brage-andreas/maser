import { getColor, gray, yellow } from "./LoggerColors.js";
import { TraceValueManager } from "./TraceValueManager.js";
import { LoggerTypes } from "../../Typings.js";
import Util from "../index.js";

/**
 * Base for other logger classes. Should not be instantiated itself.
 */
export abstract class BaseLogger {
	protected traceValues: TraceValueManager;

	/**
	 * Creates a logger.
	 */
	constructor() {
		this.traceValues = new TraceValueManager();
	}

	/**
	 * Prints base, trace, and any messages provided.
	 * All messages are parsed.
	 * Type defines what colour is printed in console.
	 */
	protected print(type: LoggerTypes, name: string, ...messages: string[]): void {
		this._printBase(type, name);
		this._printTrace();

		process.stdout.write("\n");

		const msgs = this.parse(...messages);
		if (msgs && msgs.length) {
			msgs.forEach((message) => console.log(message));
			process.stdout.write("\n");
		}
	}

	/**
	 * Parses any messages provided.
	 * Default indent is 4. Will indent with 8 if line starts with "$>".
	 */
	protected parse(...messages: string[]): string[] | null {
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

	/**
	 * Prints the base of this log, along side the current time.
	 */
	private _printBase(type: LoggerTypes, name: string): void {
		const colorFn = getColor(type);
		const timeStr = gray(Util.Now());
		const nameStr = colorFn(`[${name.toUpperCase()}]`);

		const message = Util.Parse(`${nameStr} ${timeStr}`) as string;
		process.stdout.write(message);
	}

	/**
	 * Prints the trace of this log.
	 */
	private _printTrace(): void {
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