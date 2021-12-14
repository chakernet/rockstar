import { Message } from "eris";
import Command from "../struct/Command";
import Embed from "../struct/Embed";

export default class PingCommand extends Command {
	constructor() {
		super("ping", {
			aliases: ["ping"],
		});
	}

	exec(msg: Message) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed({ description: "Hello!" }, msg.author),
		});
	}
}
