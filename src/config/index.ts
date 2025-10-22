/** Node modules */
import dotenv from "dotenv";

dotenv.config();
const config = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
};

export default config;
