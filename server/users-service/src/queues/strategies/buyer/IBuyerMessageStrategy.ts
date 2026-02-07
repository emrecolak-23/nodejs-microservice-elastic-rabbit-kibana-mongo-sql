import { BuyerMessage } from '@users/queues/types/consumer.types';

export interface IBuyerMessageStrategy {
  handle(message: BuyerMessage): Promise<void>;
  getType(): string;
}
