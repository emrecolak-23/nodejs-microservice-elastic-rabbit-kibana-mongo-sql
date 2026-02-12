import joi from 'joi';

const reviewSchema = joi.object({
  gigId: joi.string().required(),
  reviewerId: joi.string().required(),
  sellerId: joi.string().required(),
  review: joi.string().required(),
  rating: joi.number().required(),
  orderId: joi.string().required(),
  createdAt: joi.date().required(),
  reviewType: joi.string().required()
});

export { reviewSchema };
