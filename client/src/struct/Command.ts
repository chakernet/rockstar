import { Command as DefaultCommand } from "@rockstar/handler";
import Client from "./Client";

export default abstract class Command extends DefaultCommand {
	public override client!: Client;
}
