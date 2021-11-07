import { LOGGER_TYPES } from "../../constants.js";
import BaseLogger from "./BaseLogger.js";

export default class ErrorLogger extends BaseLogger {
	constructor() {
		super();
	}

	public log(...messages: string[]) {
		this.print(LOGGER_TYPES.Error, "ERROR", ...messages);
	}
}
