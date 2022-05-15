import {
	type ChatInputApplicationCommandData,
	type ChatInputCommandInteraction
} from "discord.js";
import { type Command } from "../../typings/index.js";

const data: ChatInputApplicationCommandData = {
	name: "ping",
	description: "Check if the bot is running"
};

function execute(intr: ChatInputCommandInteraction<"cached">) {
	intr.editReply("piong");

	intr.logger.log("Pinged");
}

export const getCommand = () =>
	({
		data,
		execute
	} as Partial<Command>);
