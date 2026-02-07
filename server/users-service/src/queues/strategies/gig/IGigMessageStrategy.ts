import { Channel } from 'amqplib';
import { GigMessage } from '@users/queues/types/consumer.types';

export interface IGigMessageStrategy {
  handle(message: GigMessage, channel: Channel): Promise<void>;
  getType(): string;
}
