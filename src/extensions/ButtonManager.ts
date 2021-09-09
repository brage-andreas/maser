import type { CollectorFilter, InteractionCollector, Message, User } from "discord.js";
import type { CmdIntr } from "../Typings";
import { MessageActionRow, MessageButton, MessageComponentInteraction } from "discord.js";
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

export class ConfirmationButtons extends ButtonManager {
	public interaction: CmdIntr | MessageComponentInteraction | null;
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

	public setInteraction(interaction: CmdIntr | MessageComponentInteraction | null) {
		this.interaction = interaction;
		return this;
	}

	public setQuery(query: string | null) {
		this.query = query;
		return this;
	}

	public setYesMessage(message: string | null) {
		this.yesMessage = message;
		return this;
	}

	public setNoMessage(message: string | null) {
		this.noMessage = message;
		return this;
	}

	public async start(options?: { noReply?: boolean; query?: string; onYes?: string; onNo?: string }) {
		const updateOrEditReply = async (content: string, components: MessageActionRow[]) => {
			return (
				this.interaction! instanceof MessageComponentInteraction
					? this.interaction!.update({ content, components, fetchReply: true })
					: this.interaction!.editReply({ content, components })
			) as Promise<Message>;
		};

		return new Promise<void>(async (resolve, reject) => {
			if (!this.interaction) throw new Error("Interaction must be set to the ConfirmationButtons");

			const medium = this.interaction;
			if (!this.user) this.user = medium.user;

			const onYes = options?.onYes ?? this.yesMessage ?? "Done!";
			const onNo = options?.onNo ?? this.noMessage ?? "Cancelled";

			const content = options?.query ?? this.query ?? "Are you sure?";
			const components = this.rows;

			const msg = await updateOrEditReply(content, components);
			this.setMessage(msg);

			const collector = this.createCollector({ time: "30s" });

			collector.on("collect", (intr) => {
				if (intr.customId === "yes") {
					updateOrEditReply(onYes, []);
					resolve();
				} else {
					updateOrEditReply(onNo, []);
					reject();
				}

				collector.stop("collect");
			});

			collector.on("end", (_, reason) => {
				if (reason !== "collect") updateOrEditReply("Cancelled by timeout", []);
				reject();
			});
		});
	}
}
