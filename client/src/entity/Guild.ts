import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export default class Guild extends BaseEntity {
	@PrimaryColumn()
	id?: number;

	@Column()
	prefix: string = process.env.BOT_PREFIX || "r!";
}
