import { LOGGER_TYPES } from "../../constants.js";

const colors: Record<string, string> = {
	yellow: "\x1b[93m",
	black: "\x1b[30m",
	green: "\x1b[92m",
	white: "\x1b[97m",
	blue: "\x1b[94m",
	gray: "\x1b[90m",
	red: "\x1b[91m"
};

const RESET = "\x1b[0m";
const validate = (color: string) => Object.keys(colors).includes(color);

export const wrap = (text: string, color: string) => {
	if (!validate(color.toLowerCase())) throw new TypeError(`Color must be a pre-defined color: ${color}`);
	return colors[color.toLowerCase()] + text + RESET;
};

export const yellow = (text: string) => wrap(text, "yellow");
export const black = (text: string) => wrap(text, "black");
export const green = (text: string) => wrap(text, "green");
export const white = (text: string) => wrap(text, "white");
export const blue = (text: string) => wrap(text, "blue");
export const gray = (text: string) => wrap(text, "gray");
export const red = (text: string) => wrap(text, "red");

export const getColor = (type: LOGGER_TYPES) => {
	if (type === LOGGER_TYPES.COMMAND) return green;
	if (type === LOGGER_TYPES.ERROR) return red;
	if (type === LOGGER_TYPES.EVENT) return blue;
	if (type === LOGGER_TYPES.INFO) return yellow;
	return black;
};
