import { ClientOptions as ErisClientOptions } from "eris";
import path from "path";
import {
	CommandHandler,
	ListenerHandler,
	Client as BaseClient,
} from "@rockstar/handler";
import Listener from "./Listener";
import Command from "./Command";
import CacheManager from "./CacheManager";

export default class RockstarClient extends BaseClient {
	public commandHandler: CommandHandler;
	public listenerHandler: ListenerHandler;
	public cache: CacheManager;

	constructor(token: string, options?: ErisClientOptions) {
		super(token, options);

		this.commandHandler = new CommandHandler(
			path.resolve(__dirname, "../commands"),
			{
				client: this,
				extensions: [".ts", ".js"],
				prefix: ".",
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
		);
	}
}
