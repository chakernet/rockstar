import { Command as DefaultCommand } from "@rockstar/handler";
import { Message, MessageContent, FileContent } from "eris";
import Client from "./Client";

export default abstract class Command extends DefaultCommand {
	public override client!: Client;

	protected reply(
		message: Message,
		content: MessageContent,
		file?: FileContent | FileContent[],
	) {
		if (typeof content == "string") {
			content = {
				content,
			};
		}
		content.messageReference = {
			messageID: message.id,
			channelID: message.channel.id,
			guildID: message.guildID,
		};
		this.client.createMessage(message.channel.id, content, file);
	}
}
