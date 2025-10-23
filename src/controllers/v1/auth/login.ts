/** Node modules */
import bcrypt from "bcrypt";

/** Custom modules */
import config from "@/config";
import { logger } from "@/lib/winston";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

/** Models */
import User from "@/models/user";
import Token from "@/models/token";

/** Types */
import type { Request, Response } from "express";
import type { IUser } from "@/models/user";

type UserData = Pick<IUser, "email" | "password">;

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as UserData;

    const user = await User.findOne({ email }).select("username email password role").lean().exec();
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });

      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(404).json({
        message: "You have entered wrong password",
      });

      return;
    }

    /** Generate access and refresh token for new user */
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    /** Store the refresh token in database */
    await Token.create({ token: refreshToken, userId: user._id });
    logger.info("Refresh token created successfully for user", {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info("User register successfully", user);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error during user login", err);
  }
};

export default login;
