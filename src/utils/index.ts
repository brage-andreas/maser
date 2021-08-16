export default class Util {
	static Parse(string: string | null | undefined) {
		if (!string) return null;
		return "  " + string.replace(/[\r\n]/g, "\n  ");
	}
}
