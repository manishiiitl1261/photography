const Joi = require('joi');

const validatePackage = (package) => {
  const schema = Joi.object({
    title: Joi.string().trim().required().messages({
      'string.empty': 'Title is required',
      'any.required': 'Title is required'
    }),
    description: Joi.string().trim().required().messages({
      'string.empty': 'Description is required',
      'any.required': 'Description is required'
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD').default('USD').messages({
      'string.empty': 'Currency is required',
      'any.only': 'Currency must be one of USD, EUR, GBP, or CAD'
    }),
    category: Joi.string().valid('Wedding', 'Portrait', 'Event', 'Commercial', 'Family').required().messages({
      'string.empty': 'Category is required',
      'any.only': 'Category must be one of Wedding, Portrait, Event, Commercial, or Family',
      'any.required': 'Category is required'
    }),
    features: Joi.array().items(Joi.string().trim().required()).min(1).required().messages({
      'array.min': 'At least one feature is required',
      'any.required': 'Features are required'
    }),
    duration: Joi.string().trim().required().messages({
      'string.empty': 'Duration is required',
      'any.required': 'Duration is required'
    }),
    images: Joi.number().integer().min(1).required().messages({
      'number.base': 'Number of images must be a number',
      'number.integer': 'Number of images must be an integer',
      'number.min': 'Number of images must be at least 1',
      'any.required': 'Number of images is required'
    }),
    order: Joi.number().integer().min(0).default(0),
    featured: Joi.boolean().default(false),
    popular: Joi.boolean().default(false),
    coverImage: Joi.string().allow(null, '').default(null)
  });

  return schema.validate(package, { abortEarly: false });
};

module.exports = { validatePackage }; 
 
 
 