import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('hex_session')
export class Hex_session extends BaseEntity {
    @PrimaryGeneratedColumn ({type: 'integer',})
    session_id: number;

    @Column({type: 'integer',})
    players_num: number = 0;

    @Column({type:'integer',})
    average_rating: number = 0;

    @Column({type:'simple-array',array: true})
    players_id: string[] = ["{}"];
}