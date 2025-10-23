/** Node modules */
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

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
    linkedin?: string;
    x?: string;
    youtube?: string;
  };
}

/** user schema */
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      require: [true, "Username is required"],
      maxLength: [20, "Username must be less then 20 characters"],
      unique: [true, "Username must be unique"],
    },
    email: {
      type: String,
      require: [true, "Email is required"],
      maxLength: [20, "Email must be less then 50 characters"],
      unique: [true, "Email must be unique"],
    },
    password: {
      type: String,
      require: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      require: [true, "Role is required"],
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
        maxLength: [100, "Website url must be less then 100 characters"],
      },
      facebook: {
        type: String,
        maxLength: [100, "Facebook profile url must be less then 100 characters"],
      },
      instagram: {
        type: String,
        maxLength: [100, "Instagram profile url must be less then 100 characters"],
      },
      linkedin: {
        type: String,
        maxLength: [100, "Linkedin profile url must be less then 100 characters"],
      },
      x: {
        type: String,
        maxLength: [100, "X profile url must be less then 100 characters"],
      },
      youtube: {
        type: String,
        maxLength: [100, "Youtube profile url must be less then 100 characters"],
      },
    },
  },
  {
    timestamps: true,
  },
);

/** Hasing the user password */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default model<IUser>("User", userSchema);
