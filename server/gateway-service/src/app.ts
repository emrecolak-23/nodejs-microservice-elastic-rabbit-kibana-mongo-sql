import 'reflect-metadata';
import express, { Express } from 'express';
import { container } from 'tsyringe';
import { GatewayServer } from '@gateway/server';
import { RedisConnection } from '@gateway/redis/redis.connection';

class Application {
  constructor(
    private readonly gatewayServer: GatewayServer,
    private readonly redisConnection: RedisConnection
  ) {}

  public initialize(): void {
    const app: Express = express();
    this.gatewayServer.start(app);
    this.redisConnection.connect().catch((err) => {
      console.error('Redis connection failed:', err);
    });
  }
}

const gatewayServer = container.resolve(GatewayServer);
const redisConnection = container.resolve(RedisConnection);
const application: Application = new Application(gatewayServer, redisConnection);
application.initialize();
