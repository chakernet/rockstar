import Listener from "../struct/Listener";
import type { Message as AmqpMessage, Channel as AmqpChannel } from "amqplib";
import {
	ComponentInteraction,
	Interaction,
	Message,
	UnknownInteraction,
} from "eris";

export default class GatewayEventListener extends Listener {
	constructor() {
		super("amqpMessage", {
			emitter: "client",
			event: "amqpMessage",
		});
	}

	async exec(channel: AmqpChannel, msg: AmqpMessage) {
		try {
			const parsed = JSON.parse(msg!.content.toString());

			switch (parsed.t) {
				case "MESSAGE_CREATE":
					const createMessage = new Message(parsed.d, this.client);
					this.client.cache.setMessage(createMessage);
					this.client.emit("messageCreate", createMessage);
					break;
				case "MESSAGE_UPDATE":
					const oldMessage = await this.client.cache.getMessage(
						parsed.d.id,
					);
					const newMessage = new Message(parsed.d, this.client);
					this.client.cache.setMessage(newMessage);
					this.client.emit("messageUpdate", oldMessage, newMessage);
					break;
				case "MESSAGE_DELETE":
					const deletedMessage = await this.client.cache.getMessage(
						parsed.id,
					);
					this.client.emit("messageDelete", deletedMessage);
					break;
				case "INTERACTION_CREATE":
					this.client.emit(
						"interactionCreate",
						// @ts-expect-error private method
						Interaction.from(parsed.d, this.client),
					);
					break;
			}
		} catch (error) {
			console.error(error);
		}

		channel.ack(msg!);
	}
}
