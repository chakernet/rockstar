import { Listener as DefaultListener } from "@rockstar/handler";
import Client from "./Client";

export default abstract class Listener extends DefaultListener {
	public override client!: Client;
}
