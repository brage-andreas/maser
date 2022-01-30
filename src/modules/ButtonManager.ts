import {
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	type ButtonInteraction,
	type CollectorFilter,
	type CommandInteraction,
	type InteractionCollector,
	type Message
} from "discord.js";
import ms from "ms";

// Not everything here is tested

const MAX_ROW_LEN = 5;

/**
 * Manages buttons for the client.
 */
export default class ButtonManager {
	public message: Message<true> | null;
	public rows: MessageActionRow[];

	/**
	 * Creates a button manager.
	 */
	public constructor(message?: Message<true>) {
		this.message = message ?? null;

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
	public setMessage(message: Message<true> | null): this {
		this.message = message;

		return this;
	}

	/**
	 * Creates and returns a button collector.
	 */
	public createCollector(options?: {
		filter?: CollectorFilter<[ButtonInteraction<"cached">]>;
		time?: string;
	}): InteractionCollector<ButtonInteraction<"cached">> {
		const { filter, time } = options ?? {};

		if (!this.message) throw new Error("A message must be set to the button manager");

		const milliseconds = ms(time ?? "30s");

		return this.message.createMessageComponentCollector({ filter, time: milliseconds, componentType: "BUTTON" });
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
		if (buttons.some((buttonOrRow) => Array.isArray(buttonOrRow)))
			return buttons.map((button) => (Array.isArray(button) ? button : [button]));

		return [buttons as MessageButton[]];
	}

	/**
	 * Toggles one or more buttons on or off.
	 */
	private _toggleButtons(customIds: string[], disable: boolean) {
		this.rows = this.rows.map((row) => {
			row.components = row.components.map((button) => {
				if (button.customId && customIds.includes(button.customId)) button.setDisabled(disable);

				return button;
			});

			return row;
		});
	}
}

export class ConfirmationButtons extends ButtonManager {
	public interaction: CommandInteraction<"cached"> | MessageComponentInteraction<"cached"> | null;
	public authorOnly: boolean;
	public yesMessage: string | null;
	public noMessage: string | null;
	public inverted: boolean | null;
	public authorId: string | null;
	public query: string | null;
	public time: string | null;

	public constructor(options?: { query?: string; authorId?: string; time?: string; inverted?: boolean }) {
		super();

		this.interaction = null;

		this.authorOnly = Boolean(options?.authorId);

		this.yesMessage = null;

		this.noMessage = null;

		this.inverted = options?.inverted ?? null;

		this.authorId = options?.authorId ?? null;

		this.query = null;

		this.time = options?.time ?? "30s";

		const yesButton = new MessageButton()
			.setLabel("Yes")
			.setStyle(this.inverted ? "DANGER" : "SUCCESS")
			.setCustomId("yes");

		const noButton = new MessageButton()
			.setLabel("No")
			.setStyle(this.inverted ? "SECONDARY" : "DANGER")
			.setCustomId("no");

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
		return new Promise<void>((resolve, reject) => {
			if (!this.interaction) throw new Error("Interaction must be set to the ConfirmationButtons");

			const onYes = options?.onYes ?? this.yesMessage ?? "Done!";
			const onNo = options?.onNo ?? this.noMessage ?? "Cancelled";
			const content = options?.query ?? this.query ?? "Are you sure?";
			const components = this.rows;

			this._updateOrEditReply(content, components).then((msg) => {
				this.setMessage(msg);

				const collector = this.createCollector({ time: "30s" });

				collector.on("collect", (intr) => {
					if (this.authorOnly && intr.user.id !== this.authorId) {
						intr.reply({
							content: `${intr.client.maserEmojis.cross} This button is not for you`,
							ephemeral: true
						});

						return;
					}

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
		});
	}

	private async _updateOrEditReply(content: string, components: MessageActionRow[]): Promise<Message<true>> {
		if (!this.interaction) throw new Error("Interaction must be set to the ConfirmationButtons");

		const medium = this.interaction;
		const isButtonIntr = medium instanceof MessageComponentInteraction;

		const msg = isButtonIntr
			? medium.update({ content, components, fetchReply: true })
			: medium.editReply({ content, components });

		return msg;
	}
}
