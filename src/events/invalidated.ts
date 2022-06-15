import Logger from "../loggers/index.js";

export function execute() {
	const logger = new Logger({
		type: "INVALIDATED",
		colour: "red"
	});

	logger.log("Session was invalidated");
}
