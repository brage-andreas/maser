import type { ApplicationCommandData } from "discord.js";
import type { CommandInteraction } from "../../typings.js";

export const data: ApplicationCommandData = {
	name: "ping",
	description: "Check if the bot is running"
};

export async function execute(intr: CommandInteraction) {
	intr.editReply("piong");
	intr.logger.log("Pinged");
}
