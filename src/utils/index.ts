import { type TimestampStylesString } from "@discordjs/builders";
import { type Guild, type GuildMember } from "discord.js";
import { MAX_EMBED_DESCRIPTION_LEN } from "../constants/index.js";

export default class Util extends null {
	/**
	 * Parsed any given string by indenting it with a given width of spaces.
	 * Returns null if the width is under 0 or more than 16.
	 */
	public static parse(
		string: string | null | undefined,
		width = 0
	): string | null {
		if (!string) {
			return null;
		}

		const parsedWidth = Math.ceil(width);

		if (parsedWidth < 0 || parsedWidth > 16) {
			return null;
		}

		const space = " ".repeat(parsedWidth);

		return space + string.replace(/[\r\n]/g, `\n${space}`);
	}

	/**
	 * Indents all lines or elements of any given string or array with a given width of spaces.
	 * Splits strings on new-lines.
	 */
	public static indent(
		string: Array<string> | string | null | undefined,
		width = 2,
		sep = " "
	): string | null {
		if (!string) {
			return null;
		}

		const arr = typeof string === "string" ? string.split("\n") : string;

		return arr.map((line) => sep.repeat(width) + line).join("\n");
	}

	/**
	 * Logs any given string to console.
	 */
	public static log(string: string | null | undefined): void {
		if (!string) {
			return;
		}

		console.log(Util.parse(string));
	}

	/**
	 * Makes any given number have a length of at least 2 by adding a given separator to one-digit numbers.
	 */
	public static twoLen(input: number, sep = " "): string {
		if (!sep.length) {
			throw new Error("Separator must be a non-empty string");
		}

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
	public static date(
		time: Date | number,
		style: TimestampStylesString = "R"
	): string {
		const timestamp = time instanceof Date ? time.getTime() : time;
		const seconds = Math.ceil(timestamp / 1000);

		return `<t:${seconds}:${style}>`;
	}

	/**
	 * Turns any given timestamp or date into a markdown timestamp in a `<full date> (<relative time>)` format.
	 */
	public static fullDate(time: Date | number): string {
		return `${Util.date(time, "f")} (${Util.date(time)})`;
	}

	/**
	 * Makes sure any given pair of label and codeblock fits within given size.
	 */
	public static mergeForCodeblock(
		input: string,
		options?: {
			prefix?: string | null | undefined;
			suffix?: string | null | undefined;
			maxLen?: number | null | undefined;
			lang?: string | null | undefined;
		}
	): string {
		if (!input.length) {
			throw new Error("input cannot be empty string");
		}

		const maxLen = options?.maxLen ?? MAX_EMBED_DESCRIPTION_LEN;
		const prefix = options?.prefix ?? "";
		const suffix = options?.suffix ?? "";
		const lang = options?.lang ?? "";

		const createString = (input?: string) =>
			`${prefix}\n\`\`\`${lang}\n${input ?? ""}\n\`\`\`\n${suffix}`;

		const lenWithoutInput = createString().length;
		let string = createString(input);

		if (string.length > maxLen) {
			const lenLeftForInput = maxLen - lenWithoutInput;

			string = createString(`${input.slice(0, lenLeftForInput - 3)}...`);
		}

		return string;
	}

	/**
	 * Appends a prefix and suffix to a string with a max length to cut the input by.
	 */
	public static appendPrefixAndSuffix(
		input: string,
		maxLen: number,
		options?: { prefix?: string; suffix?: string }
	): string {
		const prefix = options?.prefix ?? "";
		const suffix = options?.suffix ?? "";
		// -2 for the spaces
		// if there is no suffix, it will be one less than max
		const lenToGo = maxLen - prefix.length - suffix.length - 2;

		return `${prefix} ${input.slice(0, lenToGo)} ${suffix}`.trim();
	}

	/**
	 * Gives you a string of the three highest roles with a mention of any excess.
	 */
	public static parseRoles(memberOrGuild: Guild | GuildMember): string;
	public static parseRoles(
		memberOrGuild: Guild | GuildMember | null | undefined
	): string | null;
	public static parseRoles(memberOrGuild: null | undefined): null;
	public static parseRoles(
		memberOrGuild: Guild | GuildMember | null | undefined
	): string | null {
		if (!memberOrGuild) {
			return null;
		}

		const roles = memberOrGuild.roles.cache;

		if (roles.size <= 1) {
			return "None";
		}

		const sortedRoles = roles.sort((a, b) => b.position - a.position);

		const parsedRoles = sortedRoles
			.map((role) => role.toString())
			.slice(0, -1); // removes @everyone

		const roleMentions = parsedRoles.slice(0, 3).join(", ");
		const excess = parsedRoles.length - 3;

		return 0 < excess
			? `${roleMentions}, and ${excess} more`
			: roleMentions;
	}

	// Very simple and definitely not the best -- gets the job done
	public static escapeDiscordMarkdown(text: string): string {
		return text.replaceAll(/(\*)|(_)|(\|)|(\\)/g, (match) => `\\${match}`);
	}

	/**
	 * Listifies an array to a desired length.
	 * @param elements The elements to listify.
	 * @param desiredLength The desired amount of elements in the list.
	 * @param give The amount of extra elements to include before cutting list off.
	 */
	public static listify(
		elements: Array<string>,
		desiredLength = 1,
		give = 1
	): [Array<string>, number] {
		if (elements.length <= (desiredLength ?? 5) + (give ?? 1)) {
			return [elements, 0];
		}

		return [
			elements.slice(0, desiredLength),
			elements.length - desiredLength
		];
	}
}
