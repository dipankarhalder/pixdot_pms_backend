/** Node modules */
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

/** Custom modules */
import { logger } from "@/lib/winston";
import { verifyAccessToken } from "@/lib/jwt";

/** Types */
import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

/**
 * @function authenticate
 * @description Middleware to verify the user's access token from the Authorization header. If the token is valid, the user's ID is attached to the request object. Otherwise, it returns an appropriate error response.
 * @param {Request} req - Express request object. Expects a Bearer token in the Authorization header.
 * @param {Response} res - Express response object used to send error responses if authentication fails.
 * @param {NextFunction} next - Express next function to pass control to the next middleware.
 * @returns {void}
 */
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  /** If there's no Bearer token, respond with 401 unauthorized */
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Access denied, no token provided",
    });
    return;
  }

  /** Split out the token from the 'Bearer' prefix */
  const [_, token] = authHeader.split(" ");

  try {
    /** Verify the token and extract the userId from the payload */
    const jetPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    /** Attach the useId to the request object for later use */
    req.userId = jetPayload.userId;

    /** Proceed to the next middleware or route handler */
    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        message: "Access token expired, request a new one with refresh token",
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid Access token",
      });
      return;
    }

    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error during authentication", err);
  }
};

export default authenticate;
