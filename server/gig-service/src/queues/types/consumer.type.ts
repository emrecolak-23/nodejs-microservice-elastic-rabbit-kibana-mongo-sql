export const UPDATE_GIG_QUEUE_CONFIG = {
  exchangeName: 'jobber-update-gig',
  routingKey: 'update-gig',
  queueName: 'gig-update-queue'
};

export const SEED_GIG_QUEUE_CONFIG = {
  exchangeName: 'jobber-seed-gig',
  routingKey: 'receive-sellers',
  queueName: 'seed-gig-queue'
};

export const MESSAGE_TYPES = {
  UPDATE_GIG: 'updateGig',
  SEED_GIG: 'receiveSellers'
};
