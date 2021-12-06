import { LoggerTypes } from "../../constants.js";
import BaseLogger from "./BaseLogger.js";

export default class InfoLogger extends BaseLogger {
	public log(...messages: string[]) {
		this.print(LoggerTypes.Info, "INFO", ...messages);
	}
}
