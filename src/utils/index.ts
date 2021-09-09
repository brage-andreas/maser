export default class Util {
	/**
	 * Parsed any given string by indenting it with a given width of spaces.
	 * Returns null if the width is under 0 or more than 16.
	 */
	public static Parse(string: string | null | undefined, width = 2): string | null {
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
	public static Indent(string: string[] | string | null | undefined, width = 2): string | null {
		if (!string) return null;

		const arr = typeof string === "string" ? string.split("\n") : string;
		return arr.map((line) => " ".repeat(width) + line).join("\n");
	}

	/**
	 * Logs any given string to console.
	 */
	public static Log(string: string | null | undefined): void {
		if (!string) return;
		console.log(Util.Parse(string));
	}

	/**
	 * Makes any given number have a length of at least 2 by adding a given separator to one-digit numbers.
	 */
	public static TwoLen(input: number, sep = " "): string {
		if (!sep.length) throw new Error("Separator must be a non-empty string");

		return input < 10 ? sep + String(input) : String(input);
	}

	/**
	 * Gets and parses the current date-time in a hh:mm:ss format.
	 */
	public static Now(sep = "0"): string {
		const hours = Util.TwoLen(new Date().getHours(), sep);
		const minutes = Util.TwoLen(new Date().getMinutes(), sep);
		const seconds = Util.TwoLen(new Date().getSeconds(), sep);

		return `${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Turns any given timestamp or date into a markdown timestamp.
	 */
	public static Date(time: number | Date, style = "R"): string {
		if (time instanceof Date) time = time.getTime();
		const seconds = Math.ceil(time / 1000);

		return `<t:${seconds}:${style}>`;
	}
}
