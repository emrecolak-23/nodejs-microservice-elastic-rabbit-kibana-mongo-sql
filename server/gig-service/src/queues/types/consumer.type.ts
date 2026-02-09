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

export const UPDATE_GIG_QUEUE_CONFIG: QueueConfig = {
  exchangeName: 'jobber-update-gig',
  routingKey: 'update-gig',
  queueName: 'gig-update-queue',
  dlq: {
    exchangeName: 'jobber-dlx',
    routingKey: 'update-gig-dead',
    queueName: 'gig-update-dlq'
  }
};

export const SEED_GIG_QUEUE_CONFIG: QueueConfig = {
  exchangeName: 'jobber-seed-gig',
  routingKey: 'receive-sellers',
  queueName: 'seed-gig-queue',
  dlq: {
    exchangeName: 'jobber-dlx',
    routingKey: 'seed-gig-dead',
    queueName: 'seed-gig-dlq'
  }
};

export const MESSAGE_TYPES = {
  UPDATE_GIG: 'updateGig',
  SEED_GIG: 'receiveSellers'
} as const;

export const RETRY_CONFIG = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2
} as const;
