import { type Colour } from "../typings/index.js";

const ansiColors: Record<string, string> = {
	black: "\x1b[30m",
	blue: "\x1b[94m",
	grey: "\x1b[90m",
	green: "\x1b[92m",
	none: "\x1b[0m",
	red: "\x1b[91m",
	white: "\x1b[97m",
	yellow: "\x1b[93m"
};

const wrap = (text: string, color: string) =>
	`${ansiColors[color]}${text}${ansiColors.none}`;

export const black = (text: string) => wrap(text, "black");
export const blue = (text: string) => wrap(text, "blue");
export const green = (text: string) => wrap(text, "green");
export const grey = (text: string) => wrap(text, "grey");
export const red = (text: string) => wrap(text, "red");
export const white = (text: string) => wrap(text, "white");
export const yellow = (text: string) => wrap(text, "yellow");

export const getColourFn = (colour: Colour) => {
	switch (colour) {
		case "black":
			return black;

		case "blue":
			return blue;

		case "green":
			return green;

		case "grey":
			return grey;

		case "red":
			return red;

		case "white":
			return white;

		case "yellow":
			return yellow;
	}
};
