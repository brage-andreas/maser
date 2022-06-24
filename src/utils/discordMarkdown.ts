import createTag from "@drango/tag-functions";

// Very simple and definitely not the best, but gets the job done
const escapeMdFn = (text: string): string =>
	text.replaceAll(/(\*)|(_)|(\|)|(\\)/g, (match) => `\\${match}`);

const boldFn = (text: string): string => `**${text}**`;
const italicFn = (text: string): string => `*${text}*`;
const underlineFn = (text: string): string => `_${text}_`;

export const bold = createTag(boldFn);
export const escapeMd = createTag(escapeMdFn);
export const italic = createTag(italicFn);
export const underline = createTag(underlineFn);
