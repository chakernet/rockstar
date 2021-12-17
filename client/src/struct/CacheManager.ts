import Client from "./Client";
import { Message } from "eris";
import Redis, { ValueType } from "ioredis";

/**
 * Save objects in a redis-based cache
 */
export default class CacheManager {
	public client: Client;
	protected conn: Redis.Redis;

	/**
	 * Create a new CacheManager
	 * @constructor
	 *
	 * @param {number} port Redis Port
	 * @param {string} host Redis Host
	 * @param {Client} client Discord Client
	 */
	constructor(port: number, host: string, client: Client) {
		this.conn = new Redis(port, host);
		this.client = client;
	}

	/**
	 * Save a raw message to the cache
	 *
	 * @param {any} raw Raw message object
	 */
	public setMessage(raw: any) {
		return this.conn.setBuffer(
			`messages:${raw.id}`,
			Buffer.from(JSON.stringify(raw)),
		);
	}

	public async getMessage(id: string): Promise<Message> {
		const returned = await this.conn.getBuffer(`messages:${id}`);
		return new Message(JSON.parse(returned.toString()), this.client);
	}
}
