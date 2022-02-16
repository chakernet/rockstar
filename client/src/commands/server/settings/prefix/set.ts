import { Message } from "eris";
import Command from "../../../../struct/Command";
import Embed from "../../../../struct/Embed";

export default class PrefixSetCommand extends Command {
	constructor() {
		super("settings-prefix-set", {
			aliases: ["set"],
		});
	}

	exec(msg: Message) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed({ description: "Prefix Set" }, msg.author),
		});
	}
}
