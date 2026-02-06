import { IOrderMessage } from '@emrecolak-23/jobber-share';

export const BUYER_QUEUE_CONFIG = {
  exchangeName: 'jobber-buyer-update',
  routingKey: 'user-buyer',
  queueName: 'user-buyer-queue'
};

export const REVIEW_QUEUE_CONFIG = {
  exchangeName: 'jobber-review',
  queueName: 'seller-review-queue'
};

export const SELLER_QUEUE_CONFIG = {
  exchangeName: 'jobber-seller-update',
  routingKey: 'user-seller',
  queueName: 'user-seller-queue'
};

export const MESSAGE_TYPES = {
  BUYER: {
    AUTH: 'auth',
    UPDATE_PURCHASED_GIGS: 'update-purchased-gigs'
  },
  SELLER: {
    CREATE_ORDER: 'create-order',
    APPROVE_ORDER: 'approve-order',
    UPDATE_GIG_COUNT: 'update-gig-count',
    CANCEL_ORDER: 'cancel-order'
  },
  REVIEW: {
    CREATE_REVIEW: 'buyer-review'
  }
} as const;

export interface IBuyerAuthMessage {
  type: typeof MESSAGE_TYPES.BUYER.AUTH;
  username: string;
  email: string;
  profilePicture: string;
  country: string;
}

export interface IBuyerUpdateMessage {
  type: typeof MESSAGE_TYPES.BUYER.UPDATE_PURCHASED_GIGS;
  buyerId: string;
  purchasedGigId: string;
}

export interface ISellerCreateOrderMessage {
  type: typeof MESSAGE_TYPES.SELLER.CREATE_ORDER;
  sellerId: string;
  ongoingJobs: number;
}

export interface ISellerUpdateGigCountMessage {
  type: typeof MESSAGE_TYPES.SELLER.UPDATE_GIG_COUNT;
  gigSellerId: string;
  count: number;
}

export interface ISellerCancelOrderMessage {
  type: typeof MESSAGE_TYPES.SELLER.CANCEL_ORDER;
  sellerId: string;
}

export interface IReviewMessageDetails {
  type: typeof MESSAGE_TYPES.REVIEW.CREATE_REVIEW;
  review: string;
  rating: number;
  sellerId: string;
  gigId: string;
  reviewerId: string;
}

export type BuyerMessage = IBuyerAuthMessage | IBuyerUpdateMessage;
export type SellerMessage = ISellerCreateOrderMessage | IOrderMessage | ISellerUpdateGigCountMessage | ISellerCancelOrderMessage;
export type ReviewMessage = IReviewMessageDetails;
