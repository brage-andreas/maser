import { Clint } from "../extensions/Clint.js";
import { CmdIntr } from "../Typings.js";

export async function execute(client: Clint, intr: CmdIntr) {
    if (!intr.isCommand()) return;

    client.commands.execute(intr)
}
