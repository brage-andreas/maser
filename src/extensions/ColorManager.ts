import { COLORS } from "../Constants.js";

export class ColorManager {
	static HEX_REGEX = /^#[a-f0-9]{6}$/i;
	public colors: Map<string, `#${string}`>;

	constructor() {
		this.colors = this._get();
	}

	public get(query: string) {
		return this.colors.get(query.toUpperCase());
	}

	public try(query: string) {
		return this.colors.get(query) ?? "#000000";
	}

	public toArray() {
		const colorArray: `#${string}`[] = [];
		for (const [, color] of this.colors) {
			colorArray.push(color);
		}
		return colorArray;
	}

	public isValid(color: string) {
		color = color.trim().replace("#", "");
		return ColorManager.HEX_REGEX.test(`#${color}`);
	}

	private _get() {
		const colorMap: Map<string, `#${string}`> = new Map();
		for (const [name, color] of Object.entries(COLORS)) {
			if (!this.isValid(color)) throw new TypeError(`Supplied color is not valid hex color: ${color}`);
			colorMap.set(name.toUpperCase(), `#${color}`);
		}
		return colorMap;
	}
}
