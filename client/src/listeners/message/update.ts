import Listener from "../../struct/Listener";
import { Message } from "eris";

export default class MessageUpdateListener extends Listener {
	constructor() {
		super("messageUpdate", {
			emitter: "client",
			event: "messageUpdate",
			category: "message",
		});
	}

	exec(oldMsg: Message, newMsg: Message) {
		if (newMsg.author.bot) return;
		this.client.createMessage(
			newMsg.channel.id,
			[
				"***MESSAGE EDITED***",
				"**Old:**",
				oldMsg.content,
				"**New:**",
				newMsg.content,
			].join("\n"),
		);
	}
}
