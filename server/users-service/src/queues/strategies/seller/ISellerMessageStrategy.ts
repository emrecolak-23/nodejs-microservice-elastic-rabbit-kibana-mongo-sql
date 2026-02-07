import { SellerMessage } from '@users/queues/types/consumer.types';

export interface ISellerMessageStrategy {
  handle(message: SellerMessage): Promise<void>;
  getType(): string;
}
