import joi from 'joi';

const reviewSchema = joi.object({
  gigId: joi.string().required(),
  reviewerId: joi.string().required(),
  sellerId: joi.string().required(),
  reviewerImage: joi.string().allow(''),
  reviewerUsername: joi.string().allow(''),
  country: joi.string().allow(''),
  review: joi.string().required(),
  rating: joi.number().required(),
  orderId: joi.string().required(),
  createdAt: joi.alternatives().try(joi.date(), joi.string()).optional(),
  reviewType: joi.string().required()
});

export { reviewSchema };
