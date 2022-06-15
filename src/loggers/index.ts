// TODO: channel logging
// TODO: refactor

import { type CommandInteraction } from "discord.js";
import {
	DEFAULT_LOGGER_TYPE,
	DEFAULT_LOGGER_TYPE_COLOUR
} from "../constants/index.js";
import { type Colour } from "../typings/index.js";
import { getColourFn, grey } from "./colours.js";

const formatType = (type: string | undefined) =>
	type?.toUpperCase().padStart(3, " ");

export default class Logger {
	public colour: Colour;
	public interaction?: CommandInteraction<"cached">;
	public type: string;

	public constructor(options?: {
		type?: string;
		colour?: Colour;
		interaction?: CommandInteraction<"cached">;
	}) {
		this.type = formatType(options?.type) ?? DEFAULT_LOGGER_TYPE;

		this.colour = options?.colour ?? DEFAULT_LOGGER_TYPE_COLOUR;

		this.interaction = options?.interaction;
	}

	public log(...messages: Array<string>) {
		const date = new Date().toLocaleString("en-GB");

		const prefix = "::".padStart(this.type.length, " ");
		const colourFn = getColourFn(this.colour);

		console.log(`${colourFn(this.type)} ${grey(date)}`);

		messages.forEach((message) => {
			console.log(`${grey(prefix)} ${message}`);
		});

		console.log();
	}

	public logInteraction(...messages: Array<string>) {
		if (!this.interaction) {
			this.log(...messages);

			return;
		}

		const { guild, channel, user } = this.interaction;

		const user_ = `${grey("User:")} ${user.tag} ${grey(`(${user.id})`)}`;

		const channel_ = channel
			? ` ${grey("| Channel:")} ${channel.name} ${grey(
					`(${channel.id})`
			  )}`
			: "";

		const guild_ = ` ${grey("| Guild:")} ${guild.name} ${grey(
			`(${guild.id})`
		)}`;

		this.log(
			`${user_}${channel_}${guild_}`,
			grey(this.interaction.toString()),
			...messages
		);
	}

	public setColour(colour: Colour) {
		this.colour = colour;

		return this;
	}

	public setInteraction(interaction: CommandInteraction<"cached">) {
		this.interaction = interaction;

		return this;
	}

	public setType(type: string) {
		this.type = type;

		return this;
	}
}
