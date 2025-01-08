import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('hex_player')
export class Hex_player extends BaseEntity {
    @PrimaryGeneratedColumn ({type: 'integer',})
    player_id: number;

    @Column({type:'text', default: "Incognito"})
    player_name: string;

    @Column({type: 'integer', default: 0})
    rating: number;

    @Column({type:'text', default: 'non'})
    playerpic: string;

    @Column({type:'text',})
    pass: string;

    @Column({type:'text',})
    login: string;

    @Column({type:'text',})
    authkey: string;
}