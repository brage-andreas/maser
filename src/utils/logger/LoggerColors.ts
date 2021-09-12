import { LoggerTypes } from "../../constants.js";

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
	if (!validate(color.toLowerCase())) throw new TypeError(`color must be a pre-defined color: ${color}`);
	return colors[color.toLowerCase()] + text + RESET;
};

export const yellow = (text: string) => wrap(text, "yellow");
export const black = (text: string) => wrap(text, "black");
export const green = (text: string) => wrap(text, "green");
export const white = (text: string) => wrap(text, "white");
export const blue = (text: string) => wrap(text, "blue");
export const gray = (text: string) => wrap(text, "gray");
export const red = (text: string) => wrap(text, "red");

export const getColor = (type: LoggerTypes) => {
	if (type === LoggerTypes.COMMAND) return green;
	if (type === LoggerTypes.ERROR) return red;
	if (type === LoggerTypes.EVENT) return blue;
	if (type === LoggerTypes.INFO) return yellow;
	return black;
};
