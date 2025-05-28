import dotenv from "dotenv";

dotenv.config();

export const ENVS_VARS = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  fromEmail: process.env.FROM_EMAIL,
  region: process.env.AWS_SES_REGION,
  rateLimit: 14, // per/sec 14 mails
};
