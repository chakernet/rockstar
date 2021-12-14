import Handler from "./Handler";
import Client from "./Client";
import Collection from "@discordjs/collection";

export interface ModuleOptions {
	category?: string;
}

export default class Module {
	public id: string;
	public categoryId: string;

	public client: Client;
	public handler: Handler;
	public category: Collection<string, Module> | undefined;

	constructor(id: string, { category = "default" }: ModuleOptions) {
		this.id = id;
		this.categoryId = category;

		// @ts-expect-error
		this.client = undefined;
		// @ts-expect-error
		this.handler = undefined;
		this.category = undefined;
	}
}
