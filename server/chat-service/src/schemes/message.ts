import Joi, { ObjectSchema } from 'joi';

const messageSchema: ObjectSchema = Joi.object().keys({
  conversationId: Joi.string().optional().allow(null, ''),
  _id: Joi.string().optional(),
  body: Joi.string().optional().allow(null, ''),
  hasConversationId: Joi.boolean().optional(),
  file: Joi.string().optional().allow(null, ''),
  fileType: Joi.string().optional().allow(null, ''),
  fileName: Joi.string().optional().allow(null, ''),
  fileSize: Joi.string().optional().allow(null, ''),
  gigId: Joi.string().optional().allow(null, ''),
  sellerId: Joi.string().required().messages({
    'string.base': 'Seller id is required',
    'string.empty': 'Seller id is required',
    'any.required': 'Seller id is required'
  }),
  buyerId: Joi.string().required().messages({
    'string.base': 'Buyer id is required',
    'string.empty': 'Buyer id is required',
    'any.required': 'Buyer id is required'
  }),
  senderUsername: Joi.string().required().messages({
    'string.base': 'Sender username is required',
    'string.empty': 'Sender username is required',
    'any.required': 'Sender username is required'
  }),
  senderPicture: Joi.string().required().messages({
    'string.base': 'Sender picture is required',
    'string.empty': 'Sender picture is required',
    'any.required': 'Sender picture is required'
  }),
  receiverUsername: Joi.string().required().messages({
    'string.base': 'Receiver username is required',
    'string.empty': 'Receiver username is required',
    'any.required': 'Receiver username is required'
  }),
  receiverPicture: Joi.string().required().messages({
    'string.base': 'Receiver picture is required',
    'string.empty': 'Receiver picture is required',
    'any.required': 'Receiver picture is required'
  }),
  isRead: Joi.boolean().optional(),
  hasOffer: Joi.boolean().optional(),
  offer: Joi.object({
    gigTitle: Joi.string().optional(),
    price: Joi.number().optional(),
    description: Joi.string().optional(),
    deliveryInDays: Joi.number().optional(),
    oldDeliveryDate: Joi.string().optional(),
    newDeliveryDate: Joi.string().optional(),
    accepted: Joi.boolean().optional(),
    cancelled: Joi.boolean().optional()
  }).optional(),
  createdAt: Joi.string().optional()
});

const updateOfferSchema: ObjectSchema = Joi.object().keys({
  messageId: Joi.string().required().messages({
    'string.base': 'Message id is required',
    'string.empty': 'Message id is required',
    'any.required': 'Message id is required'
  }),
  type: Joi.string().required().messages({
    'string.base': 'Type is required',
    'string.empty': 'Type is required',
    'any.required': 'Type is required'
  })
});

const markSingleMessageSchema: ObjectSchema = Joi.object().keys({
  messageId: Joi.string().required().messages({
    'string.base': 'Message id is required',
    'string.empty': 'Message id is required',
    'any.required': 'Message id is required'
  })
});

const markMultipleMessagesSchema: ObjectSchema = Joi.object().keys({
  messageId: Joi.string().required().messages({
    'string.base': 'Message id is required',
    'string.empty': 'Message id is required',
    'any.required': 'Message id is required'
  }),
  receiverUsername: Joi.string().required().messages({
    'string.base': 'Receiver username is required',
    'string.empty': 'Receiver username is required',
    'any.required': 'Receiver username is required'
  }),
  senderUsername: Joi.string().required().messages({
    'string.base': 'Sender username is required',
    'string.empty': 'Sender username is required',
    'any.required': 'Sender username is required'
  })
});

export { messageSchema, updateOfferSchema, markSingleMessageSchema, markMultipleMessagesSchema };
