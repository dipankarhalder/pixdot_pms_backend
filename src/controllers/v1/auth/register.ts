/** Custom modules */
import config from "@/config";
import { logger } from "@/lib/winston";
import { genUsername } from "@/utils";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

/** Models */
import User from "@/models/user";
import Token from "@/models/token";

/** Types */
import type { Request, Response } from "express";
import type { IUser } from "@/models/user";

type UserData = Pick<IUser, "email" | "password" | "role">;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;

  if (role === "admin") {
    res.status(403).json({
      code: "AuthorizationError",
      message: "You cannot register as an admin",
    });

    logger.warn(`User with ${email} tried to register as an admin but it's not in the whitelist`);
    return;
  }

  try {
    const username = genUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    /** Generate access and refresh token for new user */
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    /** Store the refresh token in database */
    await Token.create({ token: refreshToken, userId: newUser._id });
    logger.info("Refresh token created successfully for user", {
      userId: newUser._id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });

    logger.info("User register successfully", {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error during user registration", err);
  }
};

export default register;
