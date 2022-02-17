import { Message } from "eris";
import Command from "../../../../struct/Command";
import Embed from "../../../../struct/Embed";

export default class PrefixSetCommand extends Command {
	constructor() {
		super("settings-prefix-set", {
			aliases: ["set"],
			description: "Set the prefix to use",
			category: "Server",
			args: [
				{
					id: "prefix",
					type: "string",
					required: true,
				},
			],
		});
	}

	async exec(msg: Message, { prefix }: { prefix: string }) {
		// get the old prefix
		const guild = await this.client.getOrCreateNewGuild(msg.guildID!);
		const oldPrefix = guild.prefix;
		guild.prefix = prefix;
		guild.save();

		this.reply(msg, {
			embed: new Embed(
				{
					title: `${this.client.emojis.check} Changed Prefix`,
					fields: [
						{
							name: "Before",
							value: `\`${oldPrefix}\``,
							inline: true,
						},
						{
							name: "After",
							value: `\`${prefix}\``,
							inline: true,
						},
					],
				},
				msg.author,
			),
		});
	}
}
