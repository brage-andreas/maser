import {
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import type Logger from "../../loggers/index.js";
import { type Command } from "../../typings/index.js";

const data: ChatInputApplicationCommandData = {
	name: "ping",
	description: "Check if the bot is running"
};

function execute(intr: ChatInputCommandInteraction<"cached">, logger: Logger) {
	intr.editReply("piong");

	logger.logInteraction("Pinged");
}

export const getCommand = () =>
	({
		data,
		execute
	} as Partial<Command>);
