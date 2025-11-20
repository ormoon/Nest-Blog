import * as Joi from 'joi';

export const validationSchema = Joi.object({
  //app
  NODE_ENV: Joi.string().valid('development', 'uat', 'production').required(),
  PORT: Joi.number().default(8000),

  //database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});
