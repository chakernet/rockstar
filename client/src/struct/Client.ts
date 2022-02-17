import { AnyChannel, ClientOptions as ErisClientOptions, Message } from "eris";
import path from "path";
import {
	CommandHandler,
	ListenerHandler,
	Client as BaseClient,
} from "@rockstar/handler";
import Listener from "./Listener";
import Command from "./Command";
import CacheManager from "./CacheManager";
import DbGuild from "../entity/Guild";
import { Connection, Repository } from "typeorm";
const Emojis = require("../../../data/emojis.json");

export default class RockstarClient extends BaseClient {
	public commandHandler: CommandHandler;
	public listenerHandler: ListenerHandler;
	public guildRepository: Repository<DbGuild>;
	public cache: CacheManager;
	public emojis: any;

	constructor(token: string, db: Connection) {
		super(token);

		this.guildRepository = db.getRepository(DbGuild);

		this.emojis = Emojis;
		this.owner = ["739969527957422202"];

		this.commandHandler = new CommandHandler(
			path.resolve(__dirname, "../commands"),
			{
				client: this,
				extensions: [".ts", ".js"],
				prefix: async (message: Message) => {
					const guild = await this.guildRepository.findOne(
						message.guildID,
					);
					if (!guild) {
						return process.env.BOT_PREFIX || "r!";
					}
					return guild.prefix!;
				},
				classToHandle: Command,
			},
		);
		this.listenerHandler = new ListenerHandler(
			path.resolve(__dirname, "../listeners"),
			{
				client: this,
				extensions: [".ts", ".js"],
				classToHandle: Listener,
			},
		);
		this.listenerHandler.attach("client", this);
		this.listenerHandler.attach("commandHandler", this.commandHandler);
		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();

		this.cache = new CacheManager(
			parseInt(process.env.REDIS_PORT!),
			process.env.REDIS_HOST!,
			this,
		);
	}

	// used for modifying a guild, or creating a new one if it doesn't exist
	public async getOrCreateNewGuild(id: string): Promise<DbGuild> {
		let guild = await this.guildRepository.findOne(id);
		if (!guild) {
			guild = new DbGuild();
			guild.id = id;
			guild.save();
		}

		return guild;
	}
}
