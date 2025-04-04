import express from "express";
import { registerUser, loginUser } from "../controllers/authController";
import protect from "../middleware/auth";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
  res.json({ message: "Protected route accessed" });
});

export default router;
