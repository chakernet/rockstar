import { Message, User } from "eris";
import Command from "../../struct/Command";
import Embed from "../../struct/Embed";

export default class BannerCommand extends Command {
	constructor() {
		super("banner", {
			aliases: ["banner", "ba"],
			category: "Info",
			args: [
				{
					id: "user",
					type: "user",
					default: (msg: Message) => msg.author,
				},
			],
		});
	}

	async exec(msg: Message, args: { user: User }) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed(
				{
					title: `${args.user.username}'s Banner`,
					image: {
						url: "",
					},
				},
				msg.author,
			),
		});
	}
}
