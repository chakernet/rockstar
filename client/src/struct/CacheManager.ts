import { Message } from "eris";
import Redis, { ValueType } from "ioredis";

export default class CacheManager {
	protected conn: Redis.Redis;

	constructor(port: number, host: string) {
		this.conn = new Redis(port, host);
	}

	public async setMessage(msg: Message) {
		await this.conn.hmset(
			`messages:${msg.id}`,
			<{ [key: string]: ValueType }>msg.toJSON(),
		);
		console.log(await this.conn.hgetall(`messages:${msg.id}`));
	}
}
