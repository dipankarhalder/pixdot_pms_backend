/** Node modules */
import { Schema, model } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    x?: string;
    youtube?: string;
  };
}

/** user schema */
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, "Username is required"],
    maxLength: [20, "Username must be less then 20 characters"],
    unique: [true, "Username must be unique"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    maxLength: [20, "Email must be less then 50 characters"],
    unique: [true, "Email must be unique"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    enum: {
      values: ["admin", "user"],
      message: "{VALUE} is not supported",
    },
    default: "user",
  },
  firstName: {
    type: String,
    maxLength: [20, "First name must be less then 20 characters"],
  },
  lastName: {
    type: String,
    maxLength: [20, "Last name must be less then 20 characters"],
  },
  socialLinks: {
    website: {
      type: String,
      maxLength: [100, "First name must be less then 20 characters"],
    },
  },
});
