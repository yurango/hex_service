import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4200);

  // const microservice = app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.TCP,
  //   options: {
  //     host:'192.168.1.65',
  //     port:4300,
  //   }
  // });
  // await app.startAllMicroservices();




}
bootstrap();
