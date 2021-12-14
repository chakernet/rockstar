import Listener from "../../struct/Listener";
import { Message } from "eris";

export default class MessageCreateListener extends Listener {
	constructor() {
		super("messageCreate", {
			emitter: "client",
			event: "messageCreate",
			category: "message",
		});
	}

	exec(msg: Message) {
		if (msg.author.bot) return;
		console.log(msg.content);
		this.client.commandHandler.handle(msg);
	}
}
