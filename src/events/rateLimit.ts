import { type Client, type RateLimitData } from "discord.js";

export async function execute(client: Client<true>, object: RateLimitData) {
	const { global, limit, method, path, route, timeout } = object;

	client.events.logger
		.setEvent("rate limit")
		.log(
			`Global: ${global}`,
			`Limit: ${limit}`,
			`Method: ${method}`,
			`Path: ${path}`,
			`Route ${route}`,
			`Timeout: ${timeout}`
		);
}
