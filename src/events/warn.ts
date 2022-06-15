import Logger from "../loggers/index.js";

export function execute(info: string) {
	const logger = new Logger({
		type: "GUILD CREATE",
		colour: "yellow"
	});

	logger.log(info);
}
