import Listener from "../struct/Listener";
import type { Message as AmqpMessage, Channel as AmqpChannel } from "amqplib";
import { Message } from "eris";

export default class GatewayEventListener extends Listener {
	constructor() {
		super("gatewayEvent", {
			emitter: "client",
			event: "gatewayEvent",
		});
	}

	exec(channel: AmqpChannel, msg: AmqpMessage) {
		console.log(msg?.content.toString());
		const parsed = JSON.parse(msg!.content.toString());

		switch (parsed.t) {
			case "MESSAGE_CREATE":
				if (parsed.d.author.bot) {
					return;
				}
				const message = new Message(parsed.d, this.client);
				this.client.commandHandler.handle(message);
				break;
		}

		channel.ack(msg!);
	}
}
