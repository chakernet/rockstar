import Listener from "../../struct/Listener";
import { Constants, Message, UnknownInteraction } from "eris";
import lev from "fast-levenshtein";
import Command from "../../struct/Command";
import Embed, { BaseEmbed } from "../../struct/Embed";
import { createInteractionCollector } from "../../util";

export default class InvalidCommandListener extends Listener {
	constructor() {
		super("invalidCommand", {
			emitter: "commandHandler",
			event: "invalidCommand",
			category: "command",
		});
	}

	async exec(msg: Message) {
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

			const newMessage = await this.client.createMessage(msg.channel.id, {
				embed: new BaseEmbed({
					title: `**${msg.parsed?.alias}** is not a command. Did you mean **${distances[0].alias}**?`,
				}),
				components: [
					{
						type: Constants.ComponentTypes.ACTION_ROW,
						components: [
							{
								type: Constants.ComponentTypes.BUTTON,
								style: Constants.ButtonStyles.SUCCESS,
								custom_id: "true",
								label: "Yes",
								disabled: false,
							},
						],
					},
				],
				messageReference: {
					messageID: msg.id,
					channelID: msg.channel.id,
					guildID: msg.guildID,
				},
			});

			createInteractionCollector(
				this.client,
				undefined,
				(interaction: UnknownInteraction) =>
					interaction.guildID == msg.guildID &&
					interaction.channel!.id == msg.channel.id &&
					interaction.message!.id == newMessage.id &&
					interaction.type ==
						Constants.InteractionTypes.MESSAGE_COMPONENT,
				async (interaction: UnknownInteraction) => {
					if ((<any>interaction.data)?.custom_id == "true") {
						await newMessage.delete();

						let newArgs = msg.content.split(" ");
						newArgs[0] = newArgs[0].replace(
							msg.parsed!.alias!,
							distances[0].alias,
						);
						msg.content = newArgs.join(" ");
						this.client.commandHandler.handle(msg);
					}
				},
			);
		}
	}
}
