import type { CollectorFilter, InteractionCollector, Message, MessageComponentInteraction, User } from "discord.js";
import { MessageActionRow, MessageButton } from "discord.js";
import ms from "ms";

type Filter = CollectorFilter<[MessageComponentInteraction]>;
type ButtonCollector = InteractionCollector<MessageComponentInteraction>;

// TODO: yes/no buttons
// TODO: refactor

/**
 * Manages buttons for the client.
 */
export default class ButtonManager {
	public rows: MessageActionRow[];
	public message: Message | null;
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
		const amountOfRows = Math.ceil(components.length / 5);
		const length = amountOfRows <= 5 ? amountOfRows : 5;

		this.rows = Array(length).fill(new MessageActionRow());

		this.rows = this.rows.map((row, i) => {
			const start = i * 5;
			const end = i * 5 + 5;
			return row.addComponents(...components.slice(start, end));
		});

		return this;
	}

	/**
	 * Sets the message for the manager. Used by the collector.
	 */
	public setMessage(message: Message): this {
		this.message = message;
		return this;
	}

	/**
	 * Sets the user for the manager. Used by the collector.
	 */
	public setUser(user: User): this {
		this.user = user;
		return this;
	}

	/**
	 * Creates and returns a button collector.
	 */
	public createCollector(options?: { filter?: Filter; time?: string; authorOnly?: boolean }): ButtonCollector {
		let { filter, time, authorOnly } = options ?? {};

		if (!this.message) throw new Error("A message must be set to the button manager");
		if (!this.user) throw new Error("A user must be set to the button manager");

		const userId = this.user.id;

		authorOnly ??= true;
		filter ??= authorOnly ? (intr) => intr.user.id === userId : () => true;

		const milliseconds = time ? ms(time) : undefined;
		return this.message.createMessageComponentCollector({ filter, time: milliseconds });
	}

	/**
	 * Disables one or more buttons on this interaction.
	 */
	public disable(intr: MessageComponentInteraction, ...customIds: string[]): this {
		this._toggleButtons(intr, customIds, true);
		return this;
	}

	/**
	 * Enables one or more buttons on this interaction.
	 */
	public enable(intr: MessageComponentInteraction, ...customIds: string[]): this {
		this._toggleButtons(intr, customIds, false);
		return this;
	}

	/**
	 * Chunks the buttons into arrays with a set size and total length
	 * @param size - How many buttons per array. Default is 5
	 * @param length - How many arrays in total. Default is 5
	 */
	public chunkButtons(buttons: MessageButton[] | MessageButton[][], size = 5, length = 5): MessageButton[][] {
		const parsedButtonsArray = this._parseButtons(buttons);
		const cutParsedButtonsArray = parsedButtonsArray.slice(0, length);

		const chunk: MessageButton[][] = [];

		cutParsedButtonsArray.forEach((buttonArray) => {
			const buttons = buttonArray.slice(0, size);
			chunk.push(buttons);
		});

		return chunk;
	}

	/**
	 * Parses buttons by nesting them appropriately.
	 */
	private _parseButtons(buttons: MessageButton[] | MessageButton[][]): MessageButton[][] {
		if (buttons.some((comp) => Array.isArray(comp))) {
			buttons = buttons.map((comp) => (Array.isArray(comp) ? comp : [comp]));
			return buttons;
		} else {
			buttons = buttons as MessageButton[];
			return [buttons];
		}
	}

	/**
	 * Toggles one or more buttons on or off, and updates the interaction with the new buttons.
	 */
	private _toggleButtons(intr: MessageComponentInteraction, customIds: string[], disable: boolean) {
		this.rows = this.rows.map((row) => {
			row.components = row.components.map((button) => {
				if (button.customId && customIds.includes(button.customId)) {
					button = button.setDisabled(disable);
				}
				return button;
			});
			return row;
		});

		intr.update({ components: [...this.rows] });
	}
}
