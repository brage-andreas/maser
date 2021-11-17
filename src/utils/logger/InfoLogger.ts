import { LOGGER_TYPES } from "../../constants.js";
import BaseLogger from "./BaseLogger.js";

export default class InfoLogger extends BaseLogger {
	public log(...messages: string[]) {
		this.print(LOGGER_TYPES.Info, "INFO", ...messages);
	}
}
