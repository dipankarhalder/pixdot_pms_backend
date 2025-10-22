/** Custom modules */
import config from "@/config";
import { logger } from "@/lib/winston";

/** Types */
import type { Request, Response } from "express";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(201).json({
      data: JSON.stringify(req.body),
      message: "New user created",
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
