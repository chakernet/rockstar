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
const Emojis = require("../../../data/emojis.json");

export default class RockstarClient extends BaseClient {
	public commandHandler: CommandHandler;
	public listenerHandler: ListenerHandler;
	public cache: CacheManager;
	public emojis: any;

	constructor(token: string, options?: ErisClientOptions) {
		super(token, options);

		this.emojis = Emojis;
		this.owner = ["739969527957422202"];

		this.commandHandler = new CommandHandler(
			path.resolve(__dirname, "../commands"),
			{
				client: this,
				extensions: [".ts", ".js"],
				prefix: async (message: Message) => {
					const guild = await DbGuild.findOne(message.guildID);
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
}
