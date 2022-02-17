import { Message } from "eris";
import Command from "../../../../struct/Command";
import Embed from "../../../../struct/Embed";

export default class PrefixSettingsCommand extends Command {
	constructor() {
		super("settings-prefix", {
			aliases: ["prefix"],
			description: "View the current prefix",
			category: "Server",
		});
	}

	async exec(msg: Message) {
		// get the prefix
		const guild = await this.client.getOrCreateNewGuild(msg.guildID!);

		this.reply(msg, {
			embed: new Embed(
				{
					fields: [
						{
							name: "Prefix",
							value: `\`${guild.prefix}\``,
							inline: true,
						},
					],
				},
				msg.author,
			),
		});
	}
}
