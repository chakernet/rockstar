import Collection from "@discordjs/collection";
import Module from "./Module";

export default class Category extends Collection<string, Module> {
	public id: string;
	public description: string;

	constructor(id: string, description = "Placeholder") {
		super();

		this.id = id;
		this.description = description;
	}
}
