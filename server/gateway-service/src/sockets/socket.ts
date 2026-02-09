import { EnvConfig } from '@gateway/configs';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Server, Socket } from 'socket.io';
import { GatewayCache } from '@gateway/redis/gateway.cache';

import { io, Socket as SocketClient } from 'socket.io-client';

const config = container.resolve(EnvConfig);
const gatewayCache = container.resolve(GatewayCache);

let chatSocketClient: SocketClient;

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;

  private log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewaySocket', 'debug');
  constructor(socketIO: Server) {
    this.io = socketIO;
    this.gatewayCache = gatewayCache;
    this.chatSocketServiceIOConnection();
  }

  public async listen(): Promise<void> {
    this.chatSocketServiceIOConnection();
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

  private chatSocketServiceIOConnection(): void {
    chatSocketClient = io(`${config.MESSAGE_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    chatSocketClient = io(`${config.MESSAGE_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    chatSocketClient.on('connect', () => {
      this.log.info('GatewayService ChatService socket connected');
    });

    chatSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      this.log.log('error', 'GatewayService ChatSocket disconnect reason:', reason);
      chatSocketClient.connect();
    });

    chatSocketClient.on('connect_error', (error: Error) => {
      this.log.log('error', 'GatewayService ChatService socket connection error:', error);
      chatSocketClient.connect();
    });
  }
}
