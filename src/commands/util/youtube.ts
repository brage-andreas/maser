import { type ChatInputApplicationCommandData, type ChatInputCommandInteraction, type Invite } from "discord.js";
import fetch from "node-fetch";
import { type Command, type CommandOptions } from "../../typings/index.js";

const options: Partial<CommandOptions> = {
	defaultHide: false
};

const data: ChatInputApplicationCommandData = {
	name: "youtube",
	description: "Starts a YouTube Together activity"
};

async function execute(intr: ChatInputCommandInteraction<"cached">) {
	const { channelId } = intr.member.voice;

	if (!channelId) {
		intr.editReply(`${intr.client.maserEmojis.cross} You need to be in a voice channel`);

		return;
	}

	const invite = (await fetch(`https://discord.com/api/v9/channels/${channelId}/invites`, {
		method: "POST",
		body: JSON.stringify({
			target_application_id: "880218394199220334",
			target_type: 2,
			validate: null
		}),
		headers: {
			"Authorization": `Bot ${intr.client.token}`,
			"Content-Type": "application/json"
		}
	})
		.then((res) => res.json())
		.catch(() => null)) as Invite | null;

	if (!invite?.code) {
		intr.editReply(`${intr.client.maserEmojis.cross} Something went wrong`);

		return;
	}

	if (invite.code === "50013") {
		intr.editReply(`${intr.client.maserEmojis.cross} I am missing permissions`);

		return;
	}

	intr.editReply(
		`${intr.client.maserEmojis.check} Done! [Click here to open](https://discord.com/invite/${invite.code})`
	);

	intr.logger.log(`Created invite to #${intr.member.voice.channel?.name ?? "unknown name"}`);
}

export const getCommand = () => ({ options, data, execute } as Partial<Command>);
