import Listener from "../../struct/Listener";
import { Message } from "eris";
import lev from "fast-levenshtein";
import Command from "../../struct/Command";
import Embed, { BaseEmbed } from "../../struct/Embed";

export default class InvalidCommandListener extends Listener {
	constructor() {
		super("invalidCommand", {
			emitter: "commandHandler",
			event: "invalidCommand",
			category: "command",
		});
	}

	exec(msg: Message) {
		console.log(msg.parsed?.alias);

		const distances: { dist: number; alias: string; cmd: Command }[] = [];
		this.client.commandHandler.modules.forEach((cmd) => {
			(<Command>cmd).aliases.forEach((a) => {
				distances.push({
					dist: lev.get(a, msg.parsed!.alias!),
					alias: a,
					cmd: <Command>cmd,
				});
			});
		});

		if (!distances || !distances.length) return;

		distances.sort((a, b) => a.dist - b.dist);

		if (distances[0].dist > 0 && distances[0].dist <= 2) {
			const command = distances[0].cmd;

			this.client.createMessage(msg.channel.id, {
				embed: new BaseEmbed({
					title: `**${msg.parsed?.alias}** is not a command. Did you mean **${distances[0].alias}**?`,
				}),
				messageReference: {
					messageID: msg.id,
					channelID: msg.channel.id,
					guildID: msg.guildID,
				},
			});
		}
	}
}
