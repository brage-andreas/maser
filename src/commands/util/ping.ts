import { ApplicationCommandData } from "discord.js";
import { CmdIntr } from "../../Typings.js";

export const data: ApplicationCommandData = {
    name: "ping",
    description:"Check that the bot is running"
}

export async function execute(intr: CmdIntr) {
    intr.editReply("piong");
}