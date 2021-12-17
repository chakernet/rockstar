import {
	Embed as DefaultEmbed,
	EmbedAuthor,
	EmbedField,
	EmbedFooter,
	EmbedImage,
	EmbedOptions,
	EmbedProvider,
	EmbedVideo,
	User,
} from "eris";

export class BaseEmbed implements DefaultEmbed {
	public title?: string;
	public type: "rich" | "image" | "video" | "gifv" | "article" | "link" =
		"rich";
	public description?: string;
	public url?: string;
	public timestamp?: string | Date;
	public color?: number;
	public footer?: EmbedFooter;
	public image?: EmbedImage;
	public thumbnail?: EmbedImage;
	public video?: EmbedVideo;
	public provider?: EmbedProvider;
	public author?: EmbedAuthor;
	public fields?: EmbedField[];

	constructor({
		title,
		description,
		url,
		timestamp,
		color,
		footer,
		image,
		thumbnail,
		author,
		fields,
	}: EmbedOptions) {
		this.title = title;
		this.description = description;
		this.url = url;
		this.timestamp = timestamp;
		this.color = color;
		this.footer = footer;
		this.image = image;
		this.thumbnail = thumbnail;
		this.author = author;
		this.fields = fields;
	}
}

export default class Embed extends BaseEmbed {
	constructor(options: EmbedOptions, user: User) {
		super(options);
	}
}
