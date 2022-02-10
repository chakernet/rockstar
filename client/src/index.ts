import "reflect-metadata";
import dotenv from "dotenv";
import Client from "./struct/Client";
import amqplib from "amqplib";
import { createConnection } from "typeorm";
import { Message } from "eris";
import Guild from "./entity/Guild";
dotenv.config({ path: "../.env" });

async function start() {
	const host = process.env.DB_HOST;
	const port = parseInt(process.env.DB_PORT || "3306");
	const username = process.env.DB_USER;
	const password = process.env.DB_PASS;
	const database = process.env.DB_DB;
	if (!host || !port || !username || !password || !database)
		throw new Error("invalid db config, check env");
	const db = await createConnection({
		type: "mysql",
		host,
		port,
		username,
		password,
		database,
		entities: [Guild],
		synchronize: true,
		logging: false,
	});

	const bot = new Client(`Bot ${process.env.BOT_TOKEN}`);
	console.log("hello");

	const conn = await amqplib.connect(<string>process.env.AMQP_URI);
	const channel = await conn.createChannel();
	channel.assertQueue("events", { durable: true });
	channel.assertExchange("events_fanout", "fanout", { durable: true });
	channel.bindQueue("events", "events_fanout", "fanout");
	channel.consume("events", (msg: amqplib.ConsumeMessage | null) => {
		bot.emit("amqpMessage", channel, msg);
	});
}

start();
