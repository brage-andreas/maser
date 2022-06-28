import { stripIndent } from "common-tags";
import { type TimestampStylesString } from "discord.js";
import { MAX_EMBED_DESCRIPTION_LEN } from "../constants/index.js";
import { bold } from "./discordMarkdown.js";

export const indent = (
	string: string,
	options?: {
		separator?: string;
		width?: number;
	}
): string => {
	const separator = options?.separator ?? " ";
	const width = options?.width ?? 2;

	const space = separator.repeat(Math.ceil(width));

	return space + string.replaceAll("\n", `\n${space}`);
};

export const twoLen = (input: number | string, separator = "0") =>
	input.toString().padStart(2, separator);

export const now = (): string => {
	const hours = new Date().getHours();
	const minutes = new Date().getMinutes();
	const seconds = new Date().getSeconds();

	return `${twoLen(hours)}:${twoLen(minutes)}:${twoLen(seconds)}`;
};

export const date = (
	time: Date | number,
	style: TimestampStylesString = "R"
): string => {
	const timestamp = time instanceof Date ? time.getTime() : time;
	const seconds = Math.ceil(timestamp / 1000);

	return `<t:${seconds}:${style}>`;
};

export const fullDate = (time: Date | number): string =>
	`${date(time, "f")} (${date(time)})`;

export const codeblock = (
	input: string,
	options?: {
		prefix?: string | null;
		suffix?: string | null;
		maxLen?: number | null;
		lang?: string | null;
	}
): string => {
	const maxLen = options?.maxLen ?? MAX_EMBED_DESCRIPTION_LEN;
	const prefix = options?.prefix ?? "";
	const suffix = options?.suffix ?? "";
	const lang = options?.lang ?? "";

	const createString = (input?: string) =>
		stripIndent`
			${prefix}
			${"```"}${lang}
			${input ?? ""}
			${"```"}
			${suffix}
		`;

	const lenWithoutInput = createString().length;
	const string = createString(input);

	if (string.length > maxLen) {
		const lenLeftForInput = maxLen - lenWithoutInput;

		return createString(`${input.slice(0, lenLeftForInput - 3)}...`);
	}

	return string;
};

export const appendPrefixAndSuffix = (
	input: string,
	options: { maxLen: number; prefix?: string; suffix?: string }
): string => {
	const prefix = options.prefix?.trim() ?? "";
	const suffix = options.suffix?.trim() ?? "";

	// -2 for the spaces between input and the affixes
	const lenToGo = options.maxLen - prefix.length - suffix.length - 2;

	return `${prefix} ${input.slice(0, lenToGo)} ${suffix}`;
};

export const listify = (
	elements: Array<string>,
	options: { desiredLen: number; give?: number }
): string => {
	const { desiredLen, give } = options ?? {};
	const elements_ = structuredClone(elements);

	if (elements_.length === 0 || elements_.length === 1) {
		return elements_.join("");
	}

	if (desiredLen + (give ?? 1) < elements_.length) {
		// something breaks when i combine these two
		elements_.splice(desiredLen);
		elements_.push(`and ${elements.length - desiredLen} more`);

		return elements_.join(", ");
	}

	if (elements_.length === 2) {
		return `${elements_[0]} and ${elements_[1]}`;
	}

	const lastElement = elements_.splice(-1);

	return `${elements_.join(", ")}, and ${lastElement[0]}`;
};

export const createList = (obj: Record<string, string | null | undefined>) =>
	Object.entries(obj)
		.filter(([, val]) => Boolean(val))
		.map(([key, val]) =>
			val === "{single}" ? `• ${bold(key)}` : `• ${bold(key)}: ${val}`
		)
		.join("\n");
