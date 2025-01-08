import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortService } from './app.tcpCheckService';

import {typeormConfig} from "./config/typeorm.config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DatabaseModule} from "./hex-game/database/database.module";
import {HexGameProviders} from "./hex-game/hex-game.providers";

import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    DatabaseModule,
    // ClientsModule.register([
    //   { name: 'MICRO_SERVICE', transport: Transport.TCP },
    // ]),
  ],
  controllers: [AppController],
  providers: [
    ...HexGameProviders,
    AppService, PortService ],
})
export class AppModule {


}
