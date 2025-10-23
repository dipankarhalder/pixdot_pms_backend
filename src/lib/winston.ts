/** Node modules */
import winston from "winston";

/** Custom modules */
import config from "@/config";

/** Destructure the format object from winston */
const { combine, timestamp, json, errors, align, printf, colorize } = winston.format;

/** Define the transports array to hold different logging transports */
const transports: winston.transport[] = [];

/** If the application is not running in production, add a console transport */
if (config.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
        align(),
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta)}` : "";
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        }),
      ),
    }),
  );
}

/** Create a logger instance using winston */
const logger = winston.createLogger({
  level: config.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports,
  silent: config.NODE_ENV === "test",
});

export { logger };
