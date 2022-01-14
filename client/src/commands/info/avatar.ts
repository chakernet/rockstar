import { Message, User } from "eris";
import Command from "../../struct/Command";
import Embed from "../../struct/Embed";

export default class AvatarCommand extends Command {
	constructor() {
		super("avatar", {
			aliases: ["avatar", "ava", "av", "pfp", "pic"],
			args: [
				{
					id: "user",
					type: "user",
				},
			],
		});
	}

	exec(msg: Message, args: { user: User }) {
		this.client.createMessage(msg.channel.id, {
			embed: new Embed(
				{
					title: `${args.user.username}'s Avatar`,
					image: {
						url: args.user.dynamicAvatarURL(undefined, 500),
					},
				},
				msg.author,
			),
		});
	}
}
