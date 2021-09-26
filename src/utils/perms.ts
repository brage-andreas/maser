import type { Channel, GuildChannel, GuildMember, TextBasedChannels } from "discord.js";

export default class PermissionManager {
	public member: GuildMember | null;

	constructor(member?: GuildMember | undefined | null) {
		this.member = member ?? null;
	}

	public setMember(member: GuildMember | null): this {
		this.member = member;
		return this;
	}

	public sendable(channel: Channel | TextBasedChannels | GuildChannel): boolean {
		this.checkMember();
		if (!channel.isText() && !channel.isThread()) return false;

		if (channel.isThread()) return channel.sendable;
		if (channel.type === "DM") return true;

		return channel.viewable && this.member!.permissions.has("SEND_MESSAGES");
	}

	public embedable(channel: Channel | TextBasedChannels | GuildChannel): boolean {
		this.checkMember();
		return this.sendable(channel) && this.member!.permissions.has("EMBED_LINKS");
	}

	private checkMember(): void {
		if (!this.member) throw new Error("A member must be set to the permission manager");
	}
}
