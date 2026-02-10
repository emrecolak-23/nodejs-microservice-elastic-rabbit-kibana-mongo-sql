import { EnvConfig } from '@gateway/configs';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { IMessageDocument, winstonLogger } from '@emrecolak-23/jobber-share';
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
  }

  public async listen(): Promise<void> {
    this.chatSocketServiceIOConnection();

    this.io.on('connection', async (socket: Socket) => {
      this.log.info(`SocketIO connection established: ${socket.id}`);

      socket.on('getLoggedInUsers', async () => {
        const loggedInUsers = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
        this.io.emit('online', loggedInUsers);
      });

      socket.on('loggedInUsers', async (username: string) => {
        const loggedInUsers = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', username);
        this.io.emit('online', loggedInUsers);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const loggedInUsers = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', username);
        this.io.emit('online', loggedInUsers);
      });

      socket.on('category', async (category: string, username: string) => {
        await this.gatewayCache.saveUserSelectedCategory(`selectedCategories:${username}`, category);
      });
    });
  }

  private chatSocketServiceIOConnection(): void {
    if (chatSocketClient?.connected) {
      return;
    }

    chatSocketClient = io(`${config.MESSAGE_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    chatSocketClient.on('connect', () => {
      this.log.info('ChatService socket connected');
    });

    chatSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      this.log.log('warn', `ChatSocket disconnected: ${reason}`);
    });

    chatSocketClient.on('connect_error', (error: Error) => {
      this.log.log('error', `ChatService socket connection error: ${error.message}`);
    });

    chatSocketClient.io.on('reconnect_attempt', (attempt: number) => {
      this.log.info(`ChatService reconnect attempt: ${attempt}`);
    });

    chatSocketClient.io.on('reconnect', (attempt: number) => {
      this.log.info(`ChatService reconnected after ${attempt} attempts`);
    });

    chatSocketClient.io.on('reconnect_failed', () => {
      this.log.error('ChatService reconnect failed after all attempts');
    });

    chatSocketClient.on('message received', (data: IMessageDocument) => {
      this.io.emit('message received', data);
    });
  }
}
