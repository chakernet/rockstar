import Listener from "../../struct/Listener";
import { Message } from "eris";
import Command from "../../struct/Command";
import Embed, { BaseEmbed } from "../../struct/Embed";

export default class OwnerOnlyListener extends Listener {
	constructor() {
		super("ownerOnly", {
			emitter: "commandHandler",
			event: "ownerOnly",
			category: "command",
		});
	}

	async exec(msg: Message, cmd: Command) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed(
				{
					description: `${this.client.emojis.x} **\`${msg.parsed?.alias}\` is reserved for bot owners!**`,
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
