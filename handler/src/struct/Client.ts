import { Client as ErisClient } from "eris";

export default class Client extends ErisClient {
	public owner?: string | string[];

	public isOwner(id: string): boolean {
		if (!this.owner) return false;
		if (Array.isArray(this.owner)) return this.owner.includes(id);
		return this.owner == id;
	}
}
