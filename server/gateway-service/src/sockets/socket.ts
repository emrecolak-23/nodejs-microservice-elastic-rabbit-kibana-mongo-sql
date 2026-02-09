import { EnvConfig } from '@gateway/configs';
import { singleton, injectable, container } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Server, Socket } from 'socket.io';
import { GatewayCache } from '@gateway/redis/gateway.cache';

const config = container.resolve(EnvConfig);
const gatewayCache = container.resolve(GatewayCache);

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;

  private log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'Socket', 'debug');
  constructor(private readonly socketIO: Server) {
    this.io = socketIO;
    this.gatewayCache = gatewayCache;
  }

  public async listen(): Promise<void> {
    this.io.on('connection', async (socket: Socket) => {
      this.log.info(`SocketIO connection established: ${socket.id}`);
      socket.on('getLoggedInUsers', async () => {
        const loggedInUsers: string[] | null = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');

        this.io.emit('online', loggedInUsers);
      });

      socket.on('loggedInUsers', async (username: string) => {
        const loggedInUsers: string[] | null = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', username);
        this.io.emit('online', loggedInUsers);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const loggedInUsers: string[] | null = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', username);
        this.io.emit('online', loggedInUsers);
      });

      socket.on('category', async (category: string, username: string) => {
        await this.gatewayCache.saveUserSelectedCategory(`selectedCategories:${username}`, category);
      });
    });
  }
}
