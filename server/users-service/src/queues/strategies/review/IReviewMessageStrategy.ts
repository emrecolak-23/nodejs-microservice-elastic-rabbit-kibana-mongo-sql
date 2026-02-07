import { Channel } from 'amqplib';
import { ReviewMessage } from '@users/queues/types/consumer.types';

export interface IReviewMessageStrategy {
  handle(message: ReviewMessage, channel: Channel): Promise<void>;
  getType(): string;
}
