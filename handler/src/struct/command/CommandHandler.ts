import Handler, { HandlerOptions } from "../Handler";
import Command from "./Command";
import Module from "../Module";
import Constants from "../../constants";
import shlex from "shlex";
import { Message, TextChannel } from "eris";

type prefixFunc = (message: Message) => string;

export interface CommandHandlerOptions extends HandlerOptions {
	owner?: string | string[];
	prefix: string | prefixFunc;
}

declare module "eris" {
	interface Message {
		parsed?: {
			alias?: string;
			prefix?: string;
		};
	}
}

export default class CommandHandler extends Handler {
	public owner: string | string[];
	public readonly prefix: string | prefixFunc;

	constructor(
		dir: string,
		{
			client,
			extensions = [".ts", ".js"],
			classToHandle = Command,
			owner = [],
			prefix,
		}: CommandHandlerOptions,
	) {
		super(dir, {
			client,
			extensions,
			classToHandle,
		});

		this.prefix = prefix;
		this.owner = owner;
	}

	private async getPrefix(message: Message): Promise<string> {
		if (typeof this.prefix == "function") {
			return await this.prefix(message);
		}

		return this.prefix;
	}

	private runPreParser(content: string): string[] {
		const splitted = shlex.split(content);

		return splitted;
	}

	private async parseArgs(
		command: Command,
		args: string[],
	): Promise<unknown> {
		// remove the command alias from the array
		args.shift();

		let parsedArgs = {};

		for (let i = 0; i < args.length; i++) {
			const commandArg = command.args[i];
			switch (commandArg.type) {
				case "string":
					Object.defineProperty(parsedArgs, commandArg.id, {
						value: args[i],
					});
					break;
				case "number":
					Object.defineProperty(parsedArgs, commandArg.id, {
						value: parseInt(args[i]),
					});
					break;
			}
		}

		return parsedArgs;
	}

	public findCommandByAlias(alias: string): Command | null {
		return this.modules.find((v: Module) => {
			const vc = v as Command;
			if (vc.aliases.includes(alias.toLowerCase())) {
				return true;
			}

			return false;
		}) as Command;
	}

	public async handle(message: Message) {
		// check if message starts with prefix
		const prefix = await this.getPrefix(message);
		if (!message.content.toLowerCase().startsWith(prefix.toLowerCase()))
			return;

		message.parsed = { prefix };

		const parsed = this.runPreParser(message.content);

		// gets the first element of the parsed, splits by prefix, and then gets the first element that has content (the alias)
		const alias = parsed[0].split(prefix).find((v) => v);
		if (!alias) {
			return;
		}
		message.parsed.alias = alias;
		const command = this.findCommandByAlias(alias);
		if (!command) {
			this.emit(Constants.commandHandler.events.invalidCommand, message);
			return;
		}
		const args = await this.parseArgs(command, parsed);

		//if (!(await this.runInhibitors(message, command))) return;

		this.emit(
			Constants.commandHandler.events.commandStarted,
			message,
			command,
		);

		try {
			await command.exec(message, args);
		} catch (error) {
			this.emit(
				Constants.commandHandler.events.error,
				message,
				command,
				error,
			);
		}

		this.emit(
			Constants.commandHandler.events.commandFinished,
			message,
			command,
		);
	}
}
