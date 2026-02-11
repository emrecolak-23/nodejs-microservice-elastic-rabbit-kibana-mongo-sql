import { EnvConfig } from '@gateway/configs';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { IAuthPayload, IMessageDocument, IOrderDocument, IOrderNotifcation, winstonLogger } from '@emrecolak-23/jobber-share';
import { Server, Socket } from 'socket.io';
import { GatewayCache } from '@gateway/redis/gateway.cache';
import { io, Socket as SocketClient } from 'socket.io-client';
import JWT from 'jsonwebtoken';

const config = container.resolve(EnvConfig);
const gatewayCache = container.resolve(GatewayCache);

let chatSocketClient: SocketClient | null;
let orderSocketClient: SocketClient | null;

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
    this.orderSocketServiceIOConnection();
    this.setupAuthMiddleware();

    this.io.on('connection', async (socket: Socket) => {
      const currentUser = socket.data.currentUser as IAuthPayload;

      const userRoom = `user:${currentUser.username}`;
      socket.join(userRoom);
      this.log.info(`SocketIO connection established: ${socket.id} | user: ${currentUser.username} | room: ${userRoom}`);

      socket.on('getLoggedInUsers', async () => {
        try {
          const loggedInUsers = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
          this.io.emit('online', loggedInUsers);
        } catch (error) {
          this.log.error('getLoggedInUsers error:', error);
        }
      });

      socket.on('loggedInUsers', async (username: string) => {
        try {
          if (username !== currentUser.username) {
            this.log.warn(`User ${currentUser.username} tried to set online status for ${username}`);
            return;
          }
          const loggedInUsers = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', username);
          this.io.emit('online', loggedInUsers);
        } catch (error) {
          this.log.error('loggedInUsers error:', error);
        }
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        try {
          if (username !== currentUser.username) {
            this.log.warn(`User ${currentUser.username} tried to remove online status for ${username}`);
            return;
          }
          const loggedInUsers = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', username);
          this.io.emit('online', loggedInUsers);
        } catch (error) {
          this.log.error('removeLoggedInUser error:', error);
        }
      });

      socket.on('category', async (category: string) => {
        try {
          await this.gatewayCache.saveUserSelectedCategory(`selectedCategories:${currentUser.username}`, category);
        } catch (error) {
          this.log.error('category error:', error);
        }
      });

      socket.on('disconnect', async (reason: string) => {
        try {
          this.log.info(`Socket disconnected: ${socket.id} | user: ${currentUser.username} | reason: ${reason}`);
          const loggedInUsers = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', currentUser.username);
          this.io.emit('online', loggedInUsers);
        } catch (error) {
          this.log.error('disconnect cleanup error:', error);
        }
      });
    });
  }

  private setupAuthMiddleware(): void {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.log.warn(`Socket connection rejected: no token provided | ip: ${socket.handshake.address}`);
        return next(new Error('Authentication token is required'));
      }

      try {
        const payload = JWT.verify(token, `${config.JWT_TOKEN}`) as IAuthPayload;
        socket.data.currentUser = payload;
        next();
      } catch (error) {
        this.log.warn(`Socket connection rejected: invalid token | ip: ${socket.handshake.address}`);
        return next(new Error('Invalid or expired token'));
      }
    });
  }

  private chatSocketServiceIOConnection(): void {
    if (chatSocketClient) {
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
      this.log.error('ChatService reconnect failed after all attempts, scheduling manual reconnect...');
      if (chatSocketClient) {
        chatSocketClient.disconnect();
        chatSocketClient = null;
      }
      setTimeout(() => this.chatSocketServiceIOConnection(), 10000);
    });

    chatSocketClient.on('message received', (data: IMessageDocument) => {
      if (data.senderUsername) {
        this.io.to(`user:${data.senderUsername}`).emit('message received', data);
      }
      if (data.receiverUsername) {
        this.io.to(`user:${data.receiverUsername}`).emit('message received', data);
      }
    });

    chatSocketClient.on('message update', (data: IMessageDocument) => {
      if (data.senderUsername) {
        this.io.to(`user:${data.senderUsername}`).emit('message updated', data);
      }
      if (data.receiverUsername) {
        this.io.to(`user:${data.receiverUsername}`).emit('message updated', data);
      }
    });
  }

  private orderSocketServiceIOConnection(): void {
    if (orderSocketClient) {
      return;
    }

    orderSocketClient = io(`${config.ORDER_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    orderSocketClient.on('connect', () => {
      this.log.info('ChatService socket connected');
    });

    orderSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      this.log.log('warn', `ChatSocket disconnected: ${reason}`);
    });

    orderSocketClient.on('connect_error', (error: Error) => {
      this.log.log('error', `ChatService socket connection error: ${error.message}`);
    });

    orderSocketClient.io.on('reconnect_attempt', (attempt: number) => {
      this.log.info(`ChatService reconnect attempt: ${attempt}`);
    });

    orderSocketClient.io.on('reconnect', (attempt: number) => {
      this.log.info(`ChatService reconnected after ${attempt} attempts`);
    });

    orderSocketClient.io.on('reconnect_failed', () => {
      this.log.error('ChatService reconnect failed after all attempts, scheduling manual reconnect...');
      if (chatSocketClient) {
        chatSocketClient.disconnect();
        chatSocketClient = null;
      }
      setTimeout(() => this.chatSocketServiceIOConnection(), 10000);
    });

    orderSocketClient.on('order notification', (data: IOrderDocument, notification: IOrderNotifcation) => {
      if (data.sellerUsername) {
        this.io.to(`user:${data.sellerUsername}`).emit('order notification', data, notification);
      }
      if (data.buyerUsername) {
        this.io.to(`user:${data.buyerUsername}`).emit('order notification', data, notification);
      }
    });
  }
}
