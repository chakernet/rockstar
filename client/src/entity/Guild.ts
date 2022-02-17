import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export default class Guild extends BaseEntity {
	@PrimaryColumn()
	id?: string;

	@Column()
	prefix: string = process.env.BOT_PREFIX || "r!";
}
