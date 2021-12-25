import { LoggerTypes } from "../constants/index.js";
import BaseLogger from "./BaseLogger.js";

export default class ErrorLogger extends BaseLogger {
	public log(...messages: string[]) {
		this.print(LoggerTypes.Error, "ERROR", ...messages);
	}
}
