import { COLORS } from "../constants.js";

/**
 * Manages colours for the client.
 */
export default class ColorManager {
	static HEX_REGEX = /^#[a-f0-9]{6}$/i;
	public colors: Map<string, `#${string}`>;

	/**
	 * Creates a colour manager.
	 */
	constructor() {
		this.colors = this._get();
	}

	/**
	 * Gets a colour from the manager.
	 */
	public get(query: string): `#${string}` | null {
		return this.colors.get(query.toUpperCase()) ?? null;
	}

	/**
	 * Tries to get a colour from the manager. Returns black if not found.
	 */
	public try(query: string): `#${string}` {
		return this.colors.get(query) ?? "#000000";
	}

	/**
	 * Returns an array of all colours in the manager.
	 */
	public toArray(): `#${string}`[] {
		const colorArray: `#${string}`[] = [];
		for (const [, color] of this.colors) {
			colorArray.push(color);
		}
		return colorArray;
	}

	/**
	 * Tests if a given string is a valid colour.
	 */
	public isValid(color: string): boolean {
		color = color.trim().replace("#", "");
		return ColorManager.HEX_REGEX.test(`#${color}`);
	}

	/**
	 * Returns all colours from CONSTANTS in a map.
	 * Throws an error if at least one colour is invalid.
	 */
	private _get() {
		const colorMap: Map<string, `#${string}`> = new Map();
		for (const [name, color] of Object.entries(COLORS)) {
			if (!this.isValid(color)) throw new TypeError(`Supplied color is not valid hex color: ${color}`);
			colorMap.set(name.toUpperCase(), `#${color}`);
		}
		return colorMap;
	}
}
