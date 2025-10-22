/** Node modules */
import { Router } from "express";
const router = Router();

/** Routes */
import authRoutes from "@/routes/v1/auth";

/** Root router */
router.get("/", (req, res) => {
  res.status(200).json({
    message: "API is live now",
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);

export default router;
