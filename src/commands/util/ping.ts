import type { ChatInputApplicationCommandData } from "discord.js";
import type { CommandInteraction, Command } from "../../typings.js";

const data: ChatInputApplicationCommandData = {
	name: "ping",
	description: "Check if the bot is running"
};

async function execute(intr: CommandInteraction) {
	intr.editReply("piong");
	intr.logger.log("Pinged");
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
