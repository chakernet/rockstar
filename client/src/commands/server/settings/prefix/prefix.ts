import { Message } from "eris";
import Command from "../../../../struct/Command";
import Embed from "../../../../struct/Embed";

export default class PrefixSettingsCommand extends Command {
	constructor() {
		super("settings-prefix", {
			aliases: ["prefix"],
		});
	}

	exec(msg: Message) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed({ description: "Prefix Menu" }, msg.author),
		});
	}
}
