import Listener from "../struct/Listener";
import type { Message as AmqpMessage, Channel as AmqpChannel } from "amqplib";
import { Message } from "eris";

export default class GatewayEventListener extends Listener {
	constructor() {
		super("amqpMessage", {
			emitter: "client",
			event: "amqpMessage",
		});
	}

	exec(channel: AmqpChannel, msg: AmqpMessage) {
		const parsed = JSON.parse(msg!.content.toString());

		switch (parsed.t) {
			case "MESSAGE_CREATE":
				this.client.emit(
					"messageCreate",
					new Message(parsed.d, this.client),
				);
				break;
		}

		channel.ack(msg!);
	}
}
