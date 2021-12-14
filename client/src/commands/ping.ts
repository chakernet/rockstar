import { Message } from "eris";
import Command from "../struct/handler/command/Command";

export default class PingCommand extends Command {
	constructor() {
		super("ping", {
			aliases: ["ping"],
		});
	}

	exec(message: Message) {
		this.client.createMessage(message.channel.id, "Pong!");
	}
}
