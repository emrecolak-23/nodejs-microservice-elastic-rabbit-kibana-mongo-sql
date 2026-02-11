export const ORDER_QUEUE_CONFIG = {
  SELLER_QUEUE_CONFIG: {
    exchangeName: 'jobber-seller-update',
    routingKey: 'user-seller'
  },
  NOTIFICATION_QUEUE_CONFIG: {
    exchangeName: 'jobber-order-notification',
    routingKey: 'order-email'
  }
};

export const MESSAGE_TYPES = {
  CREATE_ORDER: 'create-order',
  APPROVE_ORDER: 'approve-order',
  CANCEL_ORDER: 'cancel-order'
};
