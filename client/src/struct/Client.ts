import { Client as ErisClient, ClientOptions as ErisClientOptions } from "eris";
import path from "path";
import CommandHandler from "./handler/command/CommandHandler";
import ListenerHandler from "./handler/listener/ListenerHandler";

export default class RockstarClient extends ErisClient {
	public commandHandler: CommandHandler;
	public listenerHandler: ListenerHandler;

	constructor(token: string, options?: ErisClientOptions) {
		super(token, options);

		this.commandHandler = new CommandHandler(
			path.resolve(__dirname, "../commands"),
			{
				client: this,
				extensions: [".ts", ".js"],
				prefix: ".",
			},
		);
		this.listenerHandler = new ListenerHandler(
			path.resolve(__dirname, "../listeners"),
			{
				client: this,
				extensions: [".ts", ".js"],
			},
		);
		this.listenerHandler.attach("client", this);
		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
	}
}
