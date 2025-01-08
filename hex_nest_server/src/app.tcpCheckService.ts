// import { Injectable } from '@nestjs/common';
// import * as tcpPortUsed from 'tcp-port-used';
//
// @Injectable()
// export class PortService {
//     async checkUDPPort(port: number, host: string = 'localhost'): Promise<boolean> {
//         try {
//             const inUse = await tcpPortUsed.check(port, host);
//             // console.log('Port is fine');
//             return !inUse;
//         } catch (error) {
//             console.error('Error checking port:', error);
//             return false;
//         }
//     }
// }

import { Injectable, Logger } from '@nestjs/common';
import * as dgram from 'dgram';

@Injectable()
export class PortService {
    private readonly logger = new Logger(PortService.name);

    async checkUDPPortAvailability(
        port: number,
        host: string = 'localhost',
        timeout: number = 5000
    ): Promise<unknown> {
        return new Promise((resolve) => {
            const socket = dgram.createSocket('udp4');

            const timer = setTimeout(() => {
                socket.close();
                resolve({
                    available: false,
                    error: 'Port check timed out'
                });
            }, timeout);

            socket.bind(port, host, () => {
                clearTimeout(timer);
                socket.close();
                resolve({ available: true });
            });

            socket.on('error', (err) => {
                clearTimeout(timer);
                socket.close();
                resolve({
                    available: false,
                    error: err.message
                });
            });
        });
    }

    async checkPorts(portsToCheck: number[]) {
        const portStatuses = [];

        for (const port of portsToCheck) {
            const status = await this.checkUDPPortAvailability(port);
            portStatuses.push({
                port,
                status
            });
        }

        return portStatuses;
    }
}