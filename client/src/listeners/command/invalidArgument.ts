import Listener from "../../struct/Listener";
import { Message } from "eris";
import Command from "../../struct/Command";
import Embed from "../../struct/Embed";

export default class InvalidArgumentListener extends Listener {
	constructor() {
		super("invalidArgument", {
			emitter: "commandHandler",
			event: "invalidArgument",
			category: "command",
		});
	}

	async exec(msg: Message, cmd: Command, argId: string) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed(
				{
					description: `that's invalid`,
				},
				msg.author,
				true,
			),
			messageReference: {
				messageID: msg.id,
				channelID: msg.channel.id,
				guildID: msg.guildID,
			},
		});
	}
}
