import {Inject, Injectable} from '@nestjs/common';
import {HexGameDto} from "./hex-game/dto/create-hex-game.dto";
import {Repository} from 'typeorm';
import {Hex_player} from "./hex-game/player.entity";
import {Hex_session} from "./hex-game/session.entity";

import {HexSessionDto} from "./hex-game/dto/create-hex-session.dto";
import { ChildProcessWithoutNullStreams, exec, spawn} from "child_process";
import * as dgram from "dgram";
import { PortService } from './app.tcpCheckService';



@Injectable()
export class AppService {

  constructor(
      private readonly portService: PortService,
      @Inject('HEXPLAYER_REPOSITORY')
      private hexPlayerRepository: Repository<Hex_player>,
      @Inject('HEXSESSION_REPOSITORY')
      private hexSessionsRepository: Repository<Hex_session>,
  ) {}

    private readonly UEServerIP = '127.0.0.1';
    net = require('net');
    port = 7070;
    host = '192.168.1.64';
    server = this.net.createServer();
    sockets = [];
    StartingUDPport = 1024;
    private serverProcess: ChildProcessWithoutNullStreams | null = null;


// ▷ Main Listener

    grp() {
        let self = this
        this.server.listen(this.port, this.host, () => {
            console.log('TCP Server is running on port ' + this.port + '.');
        });
        this.server.on('connection', async function(sock) {
            console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
            await self.sockets.push(sock);
            let user_id = sock.remoteAddress + ':' + sock.remotePort
            let hex_session : HexSessionDto = new Hex_session
            await self.findSession(user_id, self.sockets, hex_session);


            sock.on('data', function(data) {
                console.log('DATA ' + sock.remoteAddress + ': ' + data);
                self.sockets.forEach(function(sock, index, array) {
                    sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
                });
                // Ивент при получении данных
                // Write the data back to all the connected, the client will receive it as data from the server
            });

            sock.on('close', async function(data) {

                await self.deleteUserFromSession(user_id);

                let index = await self.sockets.findIndex(function(o) {
                    return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
                })
                if (index !== -1) await self.sockets.splice(index, 1);
                console.log('CLOSED: ' + sock.remoteAddress + ':' + sock.remotePort);
            }); // Add a 'close' event handler to this instance of socket
        });

    }

// ▷ Sessions


    async findSession(user_id, sockets, hex_session) {
    // console.log(request.connection.remoteAddress, request.connection.remotePort, "ip2")

// Находим максимальное число игроков из сессий

        const firstUser = await this.hexSessionsRepository
            .createQueryBuilder("hex_session")
            .select("MAX(hex_session.players_num)", 'max')
            .where("hex_session.players_num < 6");
        const result = await firstUser.getRawOne();
        const done = await result.max;

        if (done > 5 || done == undefined) {
            console.log("undef")
            await this.hexSessionsRepository.save(hex_session)
            await this.findSession(user_id, sockets, hex_session)
        }
        else {
            console.log(done )
            await this.findSession_step2(done, user_id, sockets)
        }
    }


    // Находим сессию с этим числом игроков

    async findSession_step2(done, user_id, sockets){

        const maxplayerslobby_modify2 = await this.hexSessionsRepository
            .createQueryBuilder("hex_session")
            .select()
            .where("hex_session.players_num = :numx", { numx: done })
            .update("hex_session")
            .set({
                players_id: () => `array_append(players_id, '${String(user_id)}')`,
                players_num: () => `"players_num" + ${Number(1)}`
            })
            .execute();

        const maxplayerslobbyID = await this.hexSessionsRepository
            .createQueryBuilder("hex_session")
            .select("players_id")
            .where("hex_session.players_num = :numx", { numx: done + 1});

        const result2 = await maxplayerslobbyID.getRawOne();
        const matches = await JSON.stringify(result2).slice(16, -3).split('","')
        await console.log (matches);

        //Запускаем сервер для сессии, если игроков в лобби достаточно для запуска
        if (done == 5) {
           await this.openGame(matches, sockets)
        }
    }

    checkUDPPortAvailability(port: number, host: string = 'localhost'): Promise<boolean> {
        return new Promise((resolve) => {
            const socket = dgram.createSocket('udp4');

            socket.bind(port, host, () => {
                // Port is available
                socket.close();
                resolve(true);
            });

            socket.on('error', (err) => {
                // Port is likely in use or unavailable
                socket.close();
                resolve(false);
            });

            // Timeout in case the port check hangs
            setTimeout(() => {
                socket.close();
                resolve(false);
            }, 5000);
        });
    }





// Процедура запуска серверного клиента с указанным портом.

    async openGame(matches, sockets) {
        const { spawn } = require('child_process');
        console.log("Server Flow Created");

        let ServerIP = this.UEServerIP;
        let ActualUDPport = this.StartingUDPport
        this.StartingUDPport = ActualUDPport + 1;

// Проверка портов на занятость. Позднее прописать ограничение до 49151 порта после чего начинаются динамические порты; также сделать пропуск портов если их бракует checkPorts.
// Необходимо указать верный IP в tcpCheckService. Пока рабочий IP - 127.0.0.1

        console.log(await this.portService.checkPorts([ActualUDPport]));

// Запуск приложения клиента сервера.
       let HexServer = this.serverProcess
        async function startProcess() {
            return new Promise<void>((resolve, reject) => {

                // Windows Server
                // HexServer = spawn('./WindowsServer/Hexes1Server.exe', [`-port=${ActualUDPport}`, '-log',
                //     '-server',        // Explicitly set server mode
                //     '-batchmode']);


                // Linux Server
                HexServer = spawn('./LinuxServer/Hexes1Server.sh', [`-port=${ActualUDPport}`, '-log',
                    '-server',        // Explicitly set server mode
                    '-batchmode']);

                // Обработка события успешного запуска
                HexServer.on('spawn', () => {
                    console.log('Процесс успешно запущен');
                    resolve(); // Продолжаем выполнение кода
                });

                // Обработка ошибок
                HexServer.on('error', (err) => {
                    console.error(`Ошибка при запуске процесса: ${err.message}`);
                    reject(err);
                });

                // Обработка выхода процесса
                HexServer.on('exit', (code) => {
                    console.log(`Процесс завершён с кодом: ${code}`);
                });
            });
        }

        try {
            await startProcess();
            // Код, который нужно выполнить после успешного запуска процесса
            console.log('Код продолжает выполняться после запуска процесса');
            await matches.forEach(item =>
            {
                // console.log(item);
                sockets.forEach(function(sock, index, array) {
                    console.log(sock.remoteAddress + ':' + sock.remotePort, item);
                    if (sock.remoteAddress + ':' + sock.remotePort == item) {
                        let message = ActualUDPport;
                        let getServerIP = ServerIP;
                        console.log("true");
                        // sock.write(sock.remoteAddress + ':' + sock.remotePort + "Trying to connect to" + '\n');
                        sock.write(`${String(getServerIP)}` + `:` + `${String(message)}`);
                    }
                });
            })
        } catch (error) {
            console.error('Не удалось запустить серверный процесс:', error);
        }


// Отправка адреса и порта для подключения юзерам из сессии


    }

// Удаление юзеров из сессии при заполнении

    async deleteUserFromSession(user_id) {
        const duck = await this.hexSessionsRepository
            .createQueryBuilder("hex_session")
            .select()
            .where("hex_session.players_id @> ARRAY[:userx]", { userx: user_id})
            .update("hex_session")
            .set({
                players_id: () => `array_remove(players_id, '${String(user_id)}')`,
                players_num: () => `"players_num" - ${Number(1)}`
            })
            .execute();

        const clearSessionCheck = await this.hexSessionsRepository
            .createQueryBuilder("hex_session")
            .select()
            .where("hex_session.players_num = 0")
            .delete()
            .execute();
    }

  async createServerInstance() {
    //     const { spawn } = require('child_process');
    //   console.log("Server Flow Created");
    // await this.connectClientsToServer();
    //     const bat = spawn('E:\\Other\\Unreal\\Unreal Projects\\HexCompiled\\WindowsServer\\Hexes1Server.exe', ['-log']);
    //   return;
    }


  // ▷ Registration Process

    async checkfor_already_registred(hexgame: HexGameDto) {
        const IsUserExist = await this.hexPlayerRepository
            .createQueryBuilder("hex_player")
            .select("hex_player.login", 'LOGIN')
            .where("hex_player.login = :Login", {Login: hexgame.login})
            .getCount() > 0;

        await this.register_user(IsUserExist, hexgame)
        return IsUserExist;
    }

    async checkfor_already_registred_signin(hexgame: HexGameDto) {
        const IsUserExist = await this.hexPlayerRepository
            .createQueryBuilder("hex_player")
            .select("hex_player.login", 'LOGIN')
            .where("hex_player.login = :Login", {Login: hexgame.login})
            .getCount() > 0;

        if (IsUserExist == true) {
            const IsPassTrue = await this.hexPlayerRepository
                .createQueryBuilder("hex_player")
                .select("hex_player.pass", 'Pass')
                .where("hex_player.login = :Login", {Login: hexgame.login})
                .andWhere("hex_player.pass = :Pass", {Pass: hexgame.pass})
                .getCount() > 0;

            if (IsPassTrue == true) {
                const UserAuthKey = await this.hexPlayerRepository
                    .createQueryBuilder("hex_player")
                    .select("hex_player.authkey")
                    .where("hex_player.login = :Login", {Login: hexgame.login})
                    .getOne();

                // const key = await UserAuthKey.getRawOne()
                // const key = JSON.stringify(UserAuthKey)
                const key = UserAuthKey ? UserAuthKey.authkey : null;
                return 'true' + ',' + key;
                // return 'true' + ',' + key ? key.authkey : null;
            }
            else
                {
                    return IsPassTrue;
                }
        }
        else {return "User login is not exist"}
    }

    async register_user(IsUserExist, hexgame: HexGameDto) {
      if (IsUserExist != true)
          {
              console.log("проводим регистрацию");
              await this.hexPlayerRepository.save(hexgame)
          }
  }

    async getUserData(userData : HexGameDto){
        const findUserData = await this.hexPlayerRepository
            .createQueryBuilder("hex_player")
            .select(["hex_player.player_id", "hex_player.rating", "hex_player.playerpic", "hex_player.player_name"])
            .where("hex_player.authkey = :Authkey", {Authkey: userData.authkey})
            .getOne();

        const key = findUserData ? {player_id: findUserData.player_id, rating: findUserData.rating, playerpic: findUserData.playerpic, player_name:findUserData.player_name}  : null;
        // const key = JSON.stringify(findUserData).slice(16, -3).split('","')
        return [key.player_id, key.rating, key.playerpic, key.player_name];
    }

    // async getUserData(userData : HexGameDto){
    //     const findUserData = await this.hexPlayerRepository
    //         .createQueryBuilder("hex_player")
    //         .select("hex_player.player_id")
    //         .where("hex_player.authkey = :Authkey", {Authkey: userData.authkey})
    //         .getOne();
    //
    //     const key = findUserData ? findUserData.player_id  : null;
    //     // const key = JSON.stringify(findUserData).slice(16, -3).split('","')
    //     return key;
    // }
}