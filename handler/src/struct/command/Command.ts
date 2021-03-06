import Module, { ModuleOptions } from "../Module";
import { Message } from "eris";
import { Collection } from "@discordjs/collection";

export type ArgType = "string" | "number" | "user";
export interface Arg {
	id: string;
	type: ArgType;
	required?: boolean;
	default?: any | ((msg: Message) => any);
}

export interface CommandOptions extends ModuleOptions {
	aliases: string[];
	description?: string;
	category?: string;
	args?: Arg[];
	ownerOnly?: boolean;
	nsfw?: boolean;
	clientPermissions?: bigint[];
	userPermissions?: bigint[];
}

export default abstract class Command extends Module {
	public description: string;
	public aliases: string[];
	public parent: Command | undefined;
	public children: Collection<string, Command>;
	public args: Arg[];
	public ownerOnly: boolean;
	public nsfw: boolean;
	public clientPermissions: bigint[];
	public userPermissions: bigint[];

	constructor(
		id: string,
		{
			description = "",
			category = "default",
			aliases,
			args = [],
			ownerOnly = false,
			clientPermissions = [],
			userPermissions = [],
			nsfw = false,
		}: CommandOptions,
	) {
		super(id, {
			category,
		});

		this.description = description;
		this.parent = undefined;
		this.children = new Collection();
		this.aliases = aliases;
		this.args = args;
		this.ownerOnly = ownerOnly;
		this.clientPermissions = clientPermissions;
		this.userPermissions = userPermissions;
		this.nsfw = nsfw;
	}

	abstract exec(message: Message, args?: unknown): any | Promise<any>;
}
