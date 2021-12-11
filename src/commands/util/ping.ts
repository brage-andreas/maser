import { type ChatInputApplicationCommandData, type CommandInteraction } from "discord.js";
import { type Command } from "../../typings/index.js";

const data: ChatInputApplicationCommandData = {
	name: "ping",
	description: "Check if the bot is running"
};

async function execute(intr: CommandInteraction<"cached">) {
	intr.editReply("piong");
	intr.logger.log("Pinged");
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
