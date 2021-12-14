import dotenv from "dotenv";
import Client from "./struct/Client";
import amqplib from "amqplib";
import { Message } from "eris";
dotenv.config({ path: "../.env" });

async function start() {
	const bot = new Client(`Bot ${process.env.BOT_TOKEN}`);

	const conn = await amqplib.connect(<string>process.env.AMQP_URI);
	const channel = await conn.createChannel();
	channel.assertQueue("events");
	channel.consume("events", (msg: amqplib.ConsumeMessage | null) => {
		bot.emit("gatewayEvent", channel, msg);
	});
}

start();
