import { LoggerTypes } from "../../constants.js";
import BaseLogger from "./BaseLogger.js";

export default class InfoLogger extends BaseLogger {
	constructor() {
		super();
	}

	public log(...messages: string[]) {
		this.print(LoggerTypes.INFO, "INFO", ...messages);
	}
}
