export interface QueueConfig {
  exchangeName: string;
  routingKey: string;
  queueName: string;
  dlq: {
    exchangeName: string;
    routingKey: string;
    queueName: string;
  };
}

export const RETRY_CONFIG = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2
} as const;

export const EXCHANGE_TYPE = {
  DIRECT: 'direct',
  FANOUT: 'fanout'
} as const;

export const QUEUE_CONFIG = {
  ORDER_REVIEW_QUEUE: {
    exchangeName: 'jobber-review',
    routingKey: '',
    queueName: 'order-review-queue',
    dlq: {
      exchangeName: 'order.dlq.exchange',
      routingKey: 'order.dlq.routing.key',
      queueName: 'order.dlq.queue'
    }
  }
} as const;
