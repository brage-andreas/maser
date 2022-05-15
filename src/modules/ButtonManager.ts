import {
	type APIActionRowComponent,
	type APIButtonComponentWithCustomId
} from "discord-api-types/v9";
import {
	ButtonStyle,
	ComponentType,
	MessageComponentInteraction,
	type ButtonInteraction,
	type CollectorFilter,
	type CommandInteraction,
	type Message
} from "discord.js";
import ms from "ms";

// Not everything here is tested

/**
 * Manages buttons for the client.
 */
export default class ButtonManager {
	public message: Message<true> | null;
	public rows: Array<APIActionRowComponent<APIButtonComponentWithCustomId>>;

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
	public setRows(
		...buttons: Array<Array<APIButtonComponentWithCustomId>>
	): this {
		if (!buttons.length) {
			return this;
		}

		this.rows = Array.from(
			{ length: buttons.length },
			() =>
				({
					type: ComponentType.ActionRow,
					components: []
				} as APIActionRowComponent<APIButtonComponentWithCustomId>)
		).map((row, i) => {
			row.components = buttons[i];

			return row;
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
	}) {
		const {
 filter, time 
} = options ?? {};

		if (!this.message) {
			throw new Error("A message must be set to the button manager");
		}

		const milliseconds = ms(time ?? "30s");

		return this.message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: milliseconds,
			filter
		});
	}

	/**
	 * Disables one or more buttons on this interaction.
	 */
	public disable(...customIds: Array<string>): this {
		this._toggleButtons(customIds, true);

		return this;
	}

	/**
	 * Enables one or more buttons on this interaction.
	 */
	public enable(...customIds: Array<string>): this {
		this._toggleButtons(customIds, false);

		return this;
	}

	/**
	 * Toggles one or more buttons on or off.
	 */
	private _toggleButtons(customIds: Array<string>, disable: boolean) {
		this.rows = this.rows.map((row) => {
			row.components = row.components.map((button) => {
				if (button.custom_id && customIds.includes(button.custom_id)) {
					button.disabled = disable;
				}

				return button;
			});

			return row;
		});
	}
}

export class ConfirmationButtons extends ButtonManager {
	public invertedColors: boolean | null;
	public interaction:
		| CommandInteraction<"cached">
		| MessageComponentInteraction<"cached">
		| null;
	public authorOnly: boolean;
	public yesMessage: string | null;
	public noMessage: string | null;
	public authorId: string | null;
	public query: string | null;
	public time: string | null;

	public constructor(options?: {
		query?: string;
		authorId?: string;
		time?: string;
		inverted?: boolean;
	}) {
		super();

		this.interaction = null;

		this.authorOnly = Boolean(options?.authorId);

		this.yesMessage = null;

		this.noMessage = null;

		this.invertedColors = options?.inverted ?? null;

		this.authorId = options?.authorId ?? null;

		this.query = null;

		this.time = options?.time ?? "30s";

		const yesButton: APIButtonComponentWithCustomId = {
			custom_id: "yes",
			style: this.invertedColors
				? ButtonStyle.Danger
				: ButtonStyle.Success,
			label: "Yes",
			type: ComponentType.Button
		};

		const noButton: APIButtonComponentWithCustomId = {
			custom_id: "no",
			style: this.invertedColors
				? ButtonStyle.Success
				: ButtonStyle.Secondary,
			label: "No",
			type: ComponentType.Button
		};

		const row: APIActionRowComponent<APIButtonComponentWithCustomId> = {
			components: [yesButton, noButton],
			type: 1
		};

		this.rows = [row];
	}

	public setInteraction(
		interaction:
			| CommandInteraction<"cached">
			| MessageComponentInteraction<"cached">
			| null
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

	public async start(options?: {
		noReply?: boolean;
		query?: string;
		onYes?: string;
		onNo?: string;
	}): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (!this.interaction) {
				throw new Error(
					"Interaction must be set to the ConfirmationButtons"
				);
			}

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
						if (!options?.noReply) {
							this._updateOrEditReply(onYes, []);
						}

						resolve();
					} else {
						if (!options?.noReply) {
							this._updateOrEditReply(onNo, []);
						}

						reject();
					}

					collector.stop("collect");
				});

				collector.on("end", (_, reason) => {
					if (reason !== "collect") {
						this._updateOrEditReply("Cancelled by timeout", []);
					}

					reject();
				});
			});
		});
	}

	private async _updateOrEditReply(
		content: string,
		components: Array<APIActionRowComponent<APIButtonComponentWithCustomId>>
	): Promise<Message<true>> {
		if (!this.interaction) {
			throw new Error(
				"Interaction must be set to the ConfirmationButtons"
			);
		}

		const medium = this.interaction;
		const isButtonIntr = medium instanceof MessageComponentInteraction;

		const msg = isButtonIntr
			? medium.update({
					content,
					components,
					fetchReply: true
			  })
			: medium.editReply({
					content,
					components
			  });

		return msg;
	}
}
