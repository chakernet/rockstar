import Module, { ModuleOptions } from "../Module";

export interface ListenerOptions extends ModuleOptions {
	emitter: string;
	event: string;
	type?: string;
}

export default abstract class Listener extends Module {
	public emitter: string;
	public event: string;
	public type: string;

	constructor(id: string, { emitter, event, type = "on" }: ListenerOptions) {
		super(id, {});

		this.emitter = emitter;
		this.event = event;
		this.type = type;
	}

	abstract exec(...args: any): any | Promise<any>;
}
