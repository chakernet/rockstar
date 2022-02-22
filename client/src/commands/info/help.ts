import { Message, User } from "eris";
import Command from "../../struct/Command";

export default class HelpCommand extends Command {
	constructor() {
		super("help", {
			aliases: ["help", "commands"],
			category: "Info",
		});
	}

	async exec(msg: Message) {
		this.reply(msg, "i'm still working on the bot");
	}
}
