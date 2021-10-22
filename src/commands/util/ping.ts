import type { CommandInteraction, Command } from "../../typings.js";
import type { ApplicationCommandData } from "discord.js";

const data: ApplicationCommandData = {
	name: "ping",
	description: "Check if the bot is running"
};

async function execute(intr: CommandInteraction) {
	intr.editReply("piong");
	intr.logger.log("Pinged");
}

export const getCommand = () => ({ data, execute } as Partial<Command>);
