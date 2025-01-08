import {TypeOrmModuleOptions} from "@nestjs/typeorm";

export const typeormConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Uranforallpeople1',
    database: 'HEXDB',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,}
