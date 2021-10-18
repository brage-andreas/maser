import { MAX_EMBED_DESCRIPTION_LEN } from "../constants.js";
import { CommandInteraction } from "../typings.js";

export default class Util {
	/**
	 * Parsed any given string by indenting it with a given width of spaces.
	 * Returns null if the width is under 0 or more than 16.
	 */
	public static parse(string: string | null | undefined, width = 0): string | null {
		if (!string) return null;

		width = Math.ceil(width);
		if (width < 0 || width > 16) return null;

		const space = " ".repeat(width);
		return space + string.replace(/[\r\n]/g, "\n" + space);
	}

	/**
	 * Indents all lines or elements of any given string or array with a given width of spaces.
	 * Splits strings on new-lines.
	 */
	public static indent(string: string[] | string | null | undefined, width = 2, sep = " "): string | null {
		if (!string) return null;

		const arr = typeof string === "string" ? string.split("\n") : string;
		return arr.map((line) => sep.repeat(width) + line).join("\n");
	}

	/**
	 * Logs any given string to console.
	 */
	public static log(string: string | null | undefined): void {
		if (!string) return;
		console.log(Util.parse(string));
	}

	/**
	 * Makes any given number have a length of at least 2 by adding a given separator to one-digit numbers.
	 */
	public static twoLen(input: number, sep = " "): string {
		if (!sep.length) throw new Error("Separator must be a non-empty string");

		return input < 10 ? sep + String(input) : String(input);
	}

	/**
	 * Gets and parses the current date-time in a hh:mm:ss format.
	 */
	public static now(sep = "0"): string {
		const hours = Util.twoLen(new Date().getHours(), sep);
		const minutes = Util.twoLen(new Date().getMinutes(), sep);
		const seconds = Util.twoLen(new Date().getSeconds(), sep);

		return `${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Turns any given timestamp or date into a markdown timestamp.
	 */
	public static date(time: number | Date, style = "R"): string {
		if (time instanceof Date) time = time.getTime();
		const seconds = Math.ceil(time / 1000);

		return `<t:${seconds}:${style}>`;
	}

	/**
	 * Makes sure any given pair of label and codeblock fits within given size.
	 */
	public static fitCodeblock(code: string, options?: { label?: string; lang?: string; size?: number }): string {
		let { label, lang, size } = options ?? {};

		const CODEBLOCK_LEN = 8;

		label = !!label ? label + "\n" : "";
		size ??= 2000;
		lang ??= "";

		const totalLen = label.length + code.length + lang.length + CODEBLOCK_LEN;
		const maxLen = size - label.length - lang.length - CODEBLOCK_LEN;

		if (totalLen > MAX_EMBED_DESCRIPTION_LEN) code = code.slice(0, maxLen - 3) + "...";

		return `${label}\`\`\`${lang}\n${code}\n\`\`\``;
	}

	public static commandToString(command: CommandInteraction): string {
		const group = command.options.getSubcommandGroup(false);
		const sub = command.options.getSubcommand(false);

		const options = command.options["_hoistedOptions"]
			.filter((option) => option.value !== undefined)
			.map((option) => `${option.name}: "${option.value}"`);

		const array = [`/${command.commandName}`];

		if (group) array.push(group);
		if (sub) array.push(sub);
		if (options.length) array.push(...options);

		return array.join(" ");
	}
}
