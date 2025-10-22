/** Node modules */
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";

/** Types */
import type { CorsOptions } from "cors";

/** Custom modules */
import config from "@/config";
import limiter from "@/lib/express_rate_limit";
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongoose";

/** Router */
import v1Routes from "@/routes/v1";

/** Initial express app */
const app = express();

/** Config CORS options */
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (config.NODE_ENV === "development" || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: ${origin} is not allowed by CORS`), false);
    }
  },
};

/** Middlewares */
app.use(cors(corsOptions)); /* CORS middleware */
app.use(express.json()); /* Enable JSON request body parsing */
app.use(express.urlencoded({ extended: true })); /* Request body parsing with extended mode */
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024,
  }),
); /* Enable response compression to reduce payload size and improve performance */
app.use(helmet()); /* enhance security by setting various HTTP headers */
app.use(limiter); /* Rate limit middleware to prevent excessive requests and enhance security */

/**
 * IIFE: Immediately Invoked Async Function Expression to start the server.
 *
 * - Tries to connect to the database before initializing the server,
 * - Defines the API routes ('/api/v1'),
 * - Starts the server on the specified PORT and logs the running URL,
 * - If an error occurs during startup, it is logged, and the process exits with status 1.
 */
(async () => {
  try {
    /** Initial database */
    await connectToDatabase();

    /** Initial routes */
    app.use("/api/v1", v1Routes);

    /** Run the server */
    app.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT}`);
    });
  } catch (err) {
    console.log("Failed to start the server", err);

    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

/**
 * Handles server shutdown gracefully by disconnecting from the database.
 *
 * - Attempts to disconnect from the database before shutting down the server.
 * - Logs a success message if the disconnection is successfull.
 * - If an error occurs during disconnection, it is logged to the console.
 * - Exits the process with status code '0' (indicating a successfull shutdown).
 */
const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    console.log("Server SHUTDOWN");
    process.exit(0);
  } catch (err) {
    console.log("Error during server shutdown", err);
  }
};

/**
 * Listens for termination signals ('SIGTERM' and 'SIGINT').
 *
 * - 'SIGTERM' is typically sent when stopping a process (e.g., 'kill' command or container shutdown),
 * - 'SIGINT' is triggered when the user interrupts the process (e.g., pressing 'Ctrl + C'),
 * - When either signal is reveived, 'handleServerShutdown' is eecuted to ensure proper cleanup.
 */
process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
