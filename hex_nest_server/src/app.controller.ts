import {Body, Controller, Get, Ip, Param, Post, Req} from '@nestjs/common';
import { AppService } from './app.service';
import {HexGameDto} from "./hex-game/dto/create-hex-game.dto";

import {MessagePattern} from "@nestjs/microservices";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    this.appService.grp()
  }

  @Get('/bestsession/:userID')
  controller_findSession(@Param('userID') user_id : string, @Req() request: Request) {
    // return this.appService.findSession(user_id, request); // !void
    // return this.appService.cct(user_id);
    console.log('find_session');
    return;
  }



  // @Post('/post')
  // async postPlayerLogon(@Body() hexgamedata:HexGameDto) {
  //   return this.appService.createNewHexGame(hexgamedata);
  // }


  // @Get('/test')
  // getHello(): string {
  //   return this.appService.getHello();
  // }



  // ▷ Registration Process

  @Post('/checkfor_already_registred')
  controller_checkfor_already_registred(@Body() hexgamedata:HexGameDto) {
    return this.appService.checkfor_already_registred(hexgamedata);
  }

  @Post('/checkfor_already_registred/signin')
  controller_checkfor_already_registred_signin(@Body() hexgamedata:HexGameDto) {
    return this.appService.checkfor_already_registred_signin(hexgamedata);
  }

  @Post('/getuserdata')
  controller_getUserData(@Body() userdata:HexGameDto) {
    return this.appService.getUserData(userdata);
  }


  // @MessagePattern({ cmd: 'sum' })
  // async accumulate(data: number[]): Promise<number> {
  //   return (data || []).reduce((a, b) => a + b);
  // }


}
