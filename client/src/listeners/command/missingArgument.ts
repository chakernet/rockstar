import Listener from "../../struct/Listener";
import { Message } from "eris";
import Command from "../../struct/Command";
import Embed, { BaseEmbed } from "../../struct/Embed";

export default class MissingArgumentListener extends Listener {
	constructor() {
		super("missingArgument", {
			emitter: "commandHandler",
			event: "missingArgument",
			category: "command",
		});
	}

	async exec(msg: Message, cmd: Command, argId: string) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed(
				{
					description: `${this.client.emojis.x} **\`${argId}\` is a required argument that is missing.**`,
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
