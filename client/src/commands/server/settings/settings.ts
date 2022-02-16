import { Message } from "eris";
import Command from "../../../struct/Command";
import Embed from "../../../struct/Embed";

export default class SettingsCommand extends Command {
	constructor() {
		super("settings", {
			aliases: ["settings"],
		});
	}

	exec(msg: Message) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed({ description: "Settings Menu" }, msg.author),
		});
	}
}
