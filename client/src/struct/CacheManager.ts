import Client from "./Client";
import { AnyChannel, Channel, Message } from "eris";
import Redis from "ioredis";

export default class CacheManager {
	public client: Client;
	protected conn: Redis.Redis;

	constructor(port: number, host: string, client: Client) {
		this.conn = new Redis(port, host);
		this.client = client;
	}

	public sanitizeErisObject(obj: any, depth = 0, maxDepth = 10) {
		if (!obj) return obj;

		if (depth >= maxDepth) return obj.toString();

		if (obj.toJSON) obj = obj.toJSON();

		for (const key of Object.keys(obj)) {
			if (!obj[key]) continue;

			if (obj[key].toJSON)
				obj[key] = this.sanitizeErisObject(
					obj[key].toJSON(),
					depth + 1,
					maxDepth,
				);
			else if (obj[key].constructor.name === "Object")
				obj[key] = this.sanitizeErisObject(
					obj[key],
					depth + 1,
					maxDepth,
				);
			else if (Array.isArray(obj[key]))
				obj[key] = obj[key].map((v: any) =>
					this.sanitizeErisObject(v, depth + 1, maxDepth),
				);
		}

		return obj;
	}

	protected setObject(key: Redis.KeyType, obj: any) {
		return this.conn.setBuffer(key, Buffer.from(JSON.stringify(obj)));
	}

	protected async getObject(key: Redis.KeyType): Promise<any> {
		const returned = await this.conn.getBuffer(key);
		return JSON.parse(returned.toString());
	}

	public setMessage(message: Message) {
		return this.setObject(
			`messages:${message.id}`,
			this.sanitizeErisObject(message),
		);
	}

	public async getMessage(id: string): Promise<Message> {
		return new Message(await this.getObject(`messages:${id}`), this.client);
	}

	public setChannel(channel: Channel) {
		return this.setObject(
			`channels:${channel.id}`,
			this.sanitizeErisObject(channel),
		);
	}

	public async getChannel(id: string): Promise<AnyChannel> {
		return Channel.from(
			await this.getObject(`channels:${id}`),
			this.client,
		);
	}
}
