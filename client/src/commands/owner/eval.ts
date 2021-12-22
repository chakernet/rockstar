import { Message } from "eris";
import Command from "../../struct/Command";
import Embed from "../../struct/Embed";

export default class EvalCommand extends Command {
	constructor() {
		super("eval", {
			aliases: ["eval"],
			args: [
				{
					id: "code",
					type: "string",
					required: true,
				},
			],
			ownerOnly: true,
		});
	}

	async exec(msg: Message, args: { code: string }) {
		const start = process.hrtime();
		const clean = async (text: string) => {
			// If our input is a promise, await it before continuing
			if (text && text.constructor.name == "Promise") text = await text;

			// If the response isn't a string, `util.inspect()`
			// is used to 'stringify' the code in a safe way that
			// won't error out on objects with circular references
			// (like Collections, for example)
			if (typeof text !== "string")
				text = require("util").inspect(text, { depth: 1 });

			// Replace symbols with character code alternatives
			text = text
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203));

			// Send off the cleaned up result
			return text;
		};

		const elapsedTime = () => {
			var precision = 3; // 3 decimal places
			var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli

			if (process.hrtime(start)[0] == 0) {
				return elapsed.toFixed(precision) + "ms";
			}

			return (
				process.hrtime(start)[0] +
				"s, " +
				elapsed.toFixed(precision) +
				"ms"
			);
		};

		try {
			const evaled = eval(msg.parsed!.content!);

			const cleaned = await clean(evaled);
			this.client.addMessageReaction(msg.channel.id, msg.id, "✅");
			this.client.createMessage(msg.channel.id, {
				embed: new Embed(
					{
						title: "Eval Results",
						description: [
							`🕓 **Elapsed: \`${elapsedTime()}\`**`,
							"```js",
							cleaned,
							"```",
						].join("\n"),
						color: 65318,
					},
					msg.author,
				),
				messageReference: {
					messageID: msg.id,
					channelID: msg.channel.id,
					guildID: msg.guildID,
				},
			});
		} catch (err) {
			this.client.addMessageReaction(msg.channel.id, msg.id, "❌");
			this.client.createMessage(msg.channel.id, {
				embed: new Embed(
					{
						title: "Eval Error",
						description: [
							`🕓 **Elapsed: \`${elapsedTime()}\`**`,
							"```js",
							err,
							"```",
						].join("\n"),
					},
					msg.author,
					true,
				),
				messageReference: {
					messageID: msg.id,
					channelID: msg.channel.id,
					guildID: msg.guildID,
				},
			});
		}
	}
}
