import { DataSource } from 'typeorm';
import {Hex_player} from "./player.entity";
import {Hex_session} from "./session.entity";

export const HexGameProviders = [
    {
        provide: 'HEXPLAYER_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Hex_player),
        inject: ['DATA_SOURCE'],
    },
    {
        provide: 'HEXSESSION_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Hex_session),
        inject: ['DATA_SOURCE'],
    }
];