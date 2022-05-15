import { LoggerTypes } from "../constants/index.js";
import BaseLogger from "./BaseLogger.js";

export default class InfoLogger extends BaseLogger {
	public log(...messages: Array<string>) {
		this.print(LoggerTypes.Info, "INFO", ...messages);
	}
}
