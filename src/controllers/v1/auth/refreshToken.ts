/** Node modules */
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

/** Custom modules */
import config from "@/config";
import { logger } from "@/lib/winston";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/jwt";

/** Models */
import Token from "@/models/token";

/** Types */
import type { Request, Response } from "express";
import { Types } from "mongoose";

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const rtoken = req.cookies.refreshToken as string;

  try {
    const tokenExist = await Token.exists({ token: rtoken });
    if (!tokenExist) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    /** verify refresh token */
    const jwtPayload = verifyRefreshToken(rtoken) as { userId: Types.ObjectId };
    const accessToken = generateAccessToken(jwtPayload.userId);

    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        message: "Refresh token expired",
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid refresh token",
      });
      return;
    }

    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error during user refresh token generation", err);
  }
};

export default refreshToken;
