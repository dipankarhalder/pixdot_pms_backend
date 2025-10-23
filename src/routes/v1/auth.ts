/** Node modules */
import { Router } from "express";
import { body, cookie } from "express-validator";

/** Controllers */
import register from "@/controllers/v1/auth/register";
import login from "@/controllers/v1/auth/login";
import refreshToken from "@/controllers/v1/auth/refreshToken";

/** Middlewares */
import validationError from "@/middlewares/validationError";

const router = Router();

router.post(
  "/register",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 character")
    .isEmail()
    .withMessage("Invalid email address"),
  validationError,
  register,
);

router.post("/login", login);
router.post("/refresh-token", cookie("refreshToken"), refreshToken);

export default router;
