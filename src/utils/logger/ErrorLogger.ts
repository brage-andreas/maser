import { LoggerTypes } from "../../constants.js";
import BaseLogger from "./BaseLogger.js";

export default class ErrorLogger extends BaseLogger {
	constructor() {
		super();
	}

	public log(...messages: string[]) {
		this.print(LoggerTypes.ERROR, "ERROR", ...messages);
	}
}
