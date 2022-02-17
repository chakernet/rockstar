import Handler, { HandlerOptions } from "../Handler";
import Command from "./Command";
import Module from "../Module";
import Constants from "../../constants";
import shlex from "shlex";
import { Message, TextChannel } from "eris";
import path, { ParsedPath } from "path";

type prefixFunc = (message: Message) => Promise<string> | string;

export interface CommandHandlerOptions extends HandlerOptions {
	owner?: string | string[];
	prefix: string | prefixFunc;
}

declare module "eris" {
	interface Message {
		parsed?: {
			alias?: string;
			prefix?: string;
			content?: string;
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
			const prefix = await this.prefix(message);
			return prefix;
		}

		return this.prefix;
	}

	private runPreParser(content: string): string[] {
		const splitted = shlex.split(content);

		return splitted;
	}

	private async parseArgs(
		message: Message,
		command: Command,
		args: string[],
	): Promise<unknown> {
		// remove the command alias from the array
		args.shift();
		message.parsed!.content = args.join(" ");

		let parsedArgs = {};

		for (let i = 0; i < command.args.length; i++) {
			const commandArg = command.args[i];
			if (!args[i]) {
				if (!commandArg.default && commandArg.required) {
					this.emit(
						Constants.commandHandler.events.missingArgument,
						message,
						command,
						commandArg.id,
					);
					return;
				}

				if (typeof commandArg.default == "function") {
					const out = commandArg.default(message);
					Object.defineProperty(parsedArgs, commandArg.id, {
						value: out,
					});
				} else {
					Object.defineProperty(parsedArgs, commandArg.id, {
						value: commandArg.default,
					});
				}
				continue;
			}

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
				case "user":
					const searchedUser = new RegExp(
						/^<@(?!&)(?:!|)([0-9]+)>$/gm,
					).exec(args[i]);
					if (!searchedUser) {
						this.emit(
							Constants.commandHandler.events.invalidArgument,
							message,
							command,
							commandArg.id,
						);
						return;
					}

					const user = this.client.users.get(searchedUser[1]);
					if (!user) {
						this.emit(
							Constants.commandHandler.events.invalidArgument,
							message,
							command,
							commandArg.id,
						);
						return;
					}
					Object.defineProperty(parsedArgs, commandArg.id, {
						value: user,
					});

					break;
			}
		}

		return parsedArgs;
	}

	public findCommandByAlias(alias: string): Command | null {
		return this.modules.find((v: Module) => {
			const vc = v as Command;
			if (
				vc.aliases.includes(alias.toLowerCase()) &&
				!vc.id.includes("-")
			) {
				return true;
			}

			return false;
		}) as Command;
	}

	public register(mod: Module) {
		super.register(mod);

		// check if it is a subcommand
		// format: parentid-subcommandid
		if (mod.id.includes("-")) {
			const splitted = mod.id.split("-");
			const i = splitted.length - 1;
			const newSplit = mod.id.split("-");
			newSplit.pop();
			const id =
				splitted.length > 2 ? newSplit.join("-") : splitted[i - 1];
			let command = this.modules.get(id) as Command;
			if (!command) {
				// There is no parent command, try to load it.
				let childPath: ParsedPath | string = path.parse(mod.location!);
				childPath.base = childPath.base.replace(
					splitted[i],
					splitted[i - 1],
				);
				childPath.dir = childPath.dir.replace(`/${splitted[i]}`, "");
				childPath.dir = childPath.dir.replace(`\\${splitted[i]}`, "");
				childPath = path.format(childPath);
				try {
					command = this.load(childPath) as Command;
				} catch (err) {
					command = this.modules.get(id) as Command;
				}
				if (!command) {
					return new Error(
						`could not find parent ${splitted[i - 1]} for child ${
							splitted[i]
						}`,
					);
				}
			}
			command.children.set(splitted[i], mod as Command);
		}
	}

	public async handle(message: Message) {
		// check if message starts with prefix
		const prefix = await this.getPrefix(message);
		if (!message.content.toLowerCase().startsWith(prefix.toLowerCase()))
			return;

		message.parsed = { prefix };

		let parsed = this.runPreParser(message.content);

		// gets the first element of the parsed, splits by prefix, and then gets the first element that has content (the alias)
		const alias = parsed[0].split(prefix).find((v) => v);
		if (!alias) {
			return;
		}
		message.parsed.alias = alias;
		let command = this.findCommandByAlias(alias);
		if (!command) {
			this.emit(Constants.commandHandler.events.invalidCommand, message);
			return;
		}

		for (let i = 1; parsed.length > i; parsed.shift()) {
			const child: Command | undefined = command.children.find((c) =>
				c.aliases.includes(parsed[i]),
			);
			if (child) {
				message.parsed.alias = parsed[i];
				parsed[i] = prefix + parsed[i];
				command = child;
			} else {
				break;
			}
		}

		if (!(await this.runInhibitors(message, command))) return;

		const args = await this.parseArgs(message, command, parsed);
		if (!args) return; // a missing argument was already handled

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

	public async runInhibitors(
		message: Message,
		command: Command,
	): Promise<boolean> {
		if (command.ownerOnly) {
			if (!this.client.isOwner(message.author.id)) {
				this.emit(
					Constants.commandHandler.events.owner,
					message,
					command,
				);
				return false;
			}
		}
		return true;
	}
}
