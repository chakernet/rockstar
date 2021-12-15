import { UnknownInteraction } from "eris";
import Client from "./struct/Client";

export async function createInteractionCollector(
	client: Client,
	timeout: number = 60000,
	filter: (interaction: UnknownInteraction) => boolean,
	callback: (interaction: UnknownInteraction) => void,
) {
	const interactionListener = async (interaction: UnknownInteraction) => {
		if (await filter(interaction)) {
			await callback(interaction);
		}
	};

	client.on("interactionCreate", interactionListener);
	setTimeout(
		() => client.removeListener("interactionCreate", interactionListener),
		timeout,
	);
}
