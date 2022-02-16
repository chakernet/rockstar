import path from "path";
import fs from "fs";
import Module from "./Module";
import Client from "./Client";
import Category from "./Category";
import Collection from "@discordjs/collection";
import EventEmitter from "events";

export interface HandlerOptions {
	client: Client;
	classToHandle?: any;
	extensions?: string[];
}

export default class Handler extends EventEmitter {
	public client: Client;
	private dir: string;
	private classToHandle: any;
	private extensions: Set<string>;
	public modules: Collection<string, Module>;
	public categories: Collection<string, Category>;

	constructor(
		dir: string,
		{
			classToHandle = Module,
			client,
			extensions = [".ts", ".js", ".json"],
		}: HandlerOptions,
	) {
		super();

		this.client = client;

		this.dir = dir;
		this.extensions = new Set(extensions);
		this.classToHandle = classToHandle;
		this.modules = new Collection();
		this.categories = new Collection();
	}

	public register(mod: Module) {
		mod.client = this.client;
		mod.handler = this;

		this.modules.set(mod.id, mod);

		if (!this.categories.has(mod.categoryId))
			this.categories.set(mod.categoryId, new Category(mod.categoryId));

		const category = this.categories.get(mod.categoryId);
		mod.category = category;
		category!.set(mod.id, mod);
	}

	protected load(thing: string | Function): Module | null {
		const isClass = typeof thing == "function";

		if (!isClass && !this.extensions.has(path.extname(<string>thing)))
			return null;

		let mod = isClass
			? thing
			: function findExport(m: any): any | null {
					if (!m) return null;
					// @ts-ignore
					if (m.prototype instanceof this.classToHandle) return m;

					// @ts-ignore
					return m.default ? findExport.call(this, m.default) : null;
			  }.call(this, require(<string>thing));

		if (mod && mod.prototype instanceof this.classToHandle) {
			mod = new mod(this);
		} else {
			if (!isClass) delete require.cache[require.resolve(<string>thing)];
			return null;
		}

		if (this.modules.has(mod.id))
			throw new Error(`Module ${mod.id} Already Loaded`);

		if (!isClass) {
			mod.location = thing;
		}
		this.register(mod);
		return mod;
	}

	protected getFiles(dir: string, files_?: string[]) {
		files_ = files_ || [];
		var files = fs.readdirSync(dir);
		for (var i in files) {
			var name = dir + "/" + files[i];
			if (fs.statSync(name).isDirectory()) {
				this.getFiles(name, files_);
			} else {
				files_.push(name);
			}
		}
		return files_;
	}

	public async loadAll() {
		const files = this.getFiles(this.dir);

		for (let file of files) {
			file = path.resolve(file);

			try {
				this.load(file);
			} catch (err) {
				console.log(err);
			}
		}

		return this;
	}
}
