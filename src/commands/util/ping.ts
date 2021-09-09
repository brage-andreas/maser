import type { ApplicationCommandData } from "discord.js";
import type { CmdIntr } from "../../Typings.js";

export const data: ApplicationCommandData = {
	name: "ping",
	description: "Check if the bot is running"
};

export async function execute(intr: CmdIntr) {
	intr.editReply("piong");
	intr.logger.log("Pinged");
}
