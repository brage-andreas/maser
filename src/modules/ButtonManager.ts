import {
	type CommandInteraction,
	type CollectorFilter,
	type InteractionCollector,
	type Message,
	type User
} from "discord.js";

import { MessageActionRow, MessageButton, MessageComponentInteraction } from "discord.js";
import ms from "ms";

type Filter = CollectorFilter<[MessageComponentInteraction]>;
type ButtonCollector = InteractionCollector<MessageComponentInteraction>;

// Not everything here is tested
// prone to bugs
// so don't copy/paste without testing yourself

const MAX_ROW_LEN = 5;

/**
 * Manages buttons for the client.
 */
export default class ButtonManager {
	public message: Message | null;
	public rows: MessageActionRow[];
	public user: User | null;

	/**
	 * Creates a button manager.
	 */
	constructor(options?: { message?: Message; author?: User }) {
		const { message, author } = options ?? {};

		this.message = message ?? null;
		this.user = author ?? null;
		this.rows = [];
	}

	/**
	 * Replaces the manager's current rows with new ones from given buttons.
	 */
	public setRows(...buttons: MessageButton[] | MessageButton[][]): this {
		if (!buttons.length) return this;

		const components = this.chunkButtons(buttons);
		const amountOfRows = Math.ceil(components.length / MAX_ROW_LEN);
		const length = amountOfRows <= MAX_ROW_LEN ? amountOfRows : MAX_ROW_LEN;

		this.rows = Array(length)
			.fill(new MessageActionRow())
			.map((row, i) => {
				const start = i * MAX_ROW_LEN;
				const end = i * MAX_ROW_LEN + MAX_ROW_LEN;

				return row.addComponents(...components.slice(start, end));
			});

		return this;
	}

	/**
	 * Sets or removes the message. Used by the collector.
	 */
	public setMessage(message: Message | null): this {
		this.message = message;
		return this;
	}

	/**
	 * Sets or removes the user. Used by the collector.
	 */
	public setUser(user: User | null): this {
		this.user = user;
		return this;
	}

	/**
	 * Creates and returns a button collector.
	 */
	public createCollector(options?: { filter?: Filter; time?: string; authorOnly?: boolean }): ButtonCollector {
		let { filter, time, authorOnly } = options ?? {};

		authorOnly ??= true;
		filter ??= authorOnly ? (intr) => intr.user.id === this.user?.id : () => true;

		if (authorOnly && !this.user) throw new Error("A user must be set to the button manager");
		if (!this.message) throw new Error("A message must be set to the button manager");

		const milliseconds = time ? ms(time) : undefined;
		return this.message.createMessageComponentCollector({ filter, time: milliseconds });
	}

	/**
	 * Disables one or more buttons on this interaction.
	 */
	public disable(...customIds: string[]): this {
		this._toggleButtons(customIds, true);
		return this;
	}

	/**
	 * Enables one or more buttons on this interaction.
	 */
	public enable(...customIds: string[]): this {
		this._toggleButtons(customIds, false);
		return this;
	}

	/**
	 * Chunks the buttons into arrays with a set size and total length
	 */
	public chunkButtons(buttons: MessageButton[] | MessageButton[][], amount = 5, rows = 5): MessageButton[][] {
		const parsedButtonsArray = this._parseButtons(buttons);
		const cutParsedButtonsArray = parsedButtonsArray.slice(0, rows);

		const chunk: MessageButton[][] = [];

		cutParsedButtonsArray.forEach((buttonArray) => {
			const buttons = buttonArray.slice(0, amount);
			chunk.push(buttons);
		});

		return chunk;
	}

	/**
	 * Parses buttons by nesting them appropriately.
	 */
	private _parseButtons(buttons: MessageButton[] | MessageButton[][]): MessageButton[][] {
		if (buttons.some((buttonOrRow) => Array.isArray(buttonOrRow))) {
			return buttons.map((comp) => (Array.isArray(comp) ? comp : [comp]));
		} else {
			return [buttons as MessageButton[]];
		}
	}

	/**
	 * Toggles one or more buttons on or off.
	 */
	private _toggleButtons(customIds: string[], disable: boolean) {
		this.rows = this.rows.map((row) => {
			row.components = row.components.map((button) => {
				if (button.customId && customIds.includes(button.customId)) {
					button = button.setDisabled(disable);
				}
				return button;
			});
			return row;
		});
	}
}

export class ConfirmationButtons extends ButtonManager {
	public interaction: CommandInteraction<"cached"> | MessageComponentInteraction<"cached"> | null;
	public yesMessage: string | null;
	public noMessage: string | null;
	public query: string | null;
	public time: string | null;

	constructor(options?: { query?: string; author?: User; time?: string }) {
		super(options);

		this.interaction = null;
		this.yesMessage = null;
		this.noMessage = null;
		this.query = null;

		this.time = options?.time ?? "30s";

		const yesButton = new MessageButton().setLabel("Yes").setStyle("SUCCESS").setCustomId("yes");
		const noButton = new MessageButton().setLabel("No").setStyle("DANGER").setCustomId("no");

		const row = new MessageActionRow().addComponents(yesButton, noButton);
		this.rows = [row];
	}

	public setInteraction(
		interaction: CommandInteraction<"cached"> | MessageComponentInteraction<"cached"> | null
	): this {
		this.interaction = interaction;
		return this;
	}

	public setQuery(query: string | null): this {
		this.query = query;
		return this;
	}

	public setYesMessage(message: string | null): this {
		this.yesMessage = message;
		return this;
	}

	public setNoMessage(message: string | null): this {
		this.noMessage = message;
		return this;
	}

	public async start(options?: { noReply?: boolean; query?: string; onYes?: string; onNo?: string }): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			if (!this.interaction) throw new Error("Interaction must be set to the ConfirmationButtons");

			const medium = this.interaction;
			if (!this.user) this.user = medium.user;

			const onYes = options?.onYes ?? this.yesMessage ?? "Done!";
			const onNo = options?.onNo ?? this.noMessage ?? "Cancelled";

			const content = options?.query ?? this.query ?? "Are you sure?";
			const components = this.rows;

			const msg = await this._updateOrEditReply(content, components);
			this.setMessage(msg);

			const collector = this.createCollector({ time: "30s" });

			collector.on("collect", (intr) => {
				if (intr.customId === "yes") {
					if (!options?.noReply) this._updateOrEditReply(onYes, []);
					resolve();
				} else {
					if (!options?.noReply) this._updateOrEditReply(onNo, []);
					reject();
				}

				collector.stop("collect");
			});

			collector.on("end", (_, reason) => {
				if (reason !== "collect") this._updateOrEditReply("Cancelled by timeout", []);
				reject();
			});
		});
	}

	private async _updateOrEditReply(content: string, components: MessageActionRow[]): Promise<Message> {
		if (!this.interaction) throw new Error("Interaction must be set to the ConfirmationButtons");

		const medium = this.interaction;
		const isButtonIntr = medium instanceof MessageComponentInteraction;

		const msg = isButtonIntr
			? medium.update({ content, components, fetchReply: true })
			: medium.editReply({ content, components });

		return msg as Promise<Message>;
	}
}
