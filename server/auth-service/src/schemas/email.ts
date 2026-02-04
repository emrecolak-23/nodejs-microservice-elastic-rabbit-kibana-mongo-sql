import Joi, { ObjectSchema } from 'joi';

const verifyEmailSchema: ObjectSchema = Joi.object().keys({
  token: Joi.string().email().required().messages({
    'string.base': 'Field must be valid',
    'string.required': 'Field must be valid'
  })
});

export { verifyEmailSchema };
