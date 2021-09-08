import type { Channel, GuildChannel, GuildMember, TextBasedChannels } from "discord.js";

export default abstract class {
	static sendable(me: GuildMember, channel: Channel | GuildChannel | TextBasedChannels) {
		if (!channel.isText()) return false;
		if (channel.isThread()) return channel.sendable;
		if (channel.type === "DM") return true;

		const perms = channel.permissionsFor(me);
		if (perms && perms.has("SEND_MESSAGES") && channel.viewable) return true;

		return false;
	}
}
