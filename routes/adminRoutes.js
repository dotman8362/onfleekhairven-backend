import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  // TEMP credentials
  if (email === "onfleekhairven@gmail.com" && password === "6512") {
    // generate token
    const token = jwt.sign(
      { email }, 
      process.env.JWT_SECRET || "your_secret_key", 
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      message: "Admin login successful",
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid admin credentials",
  });
});

export default router;
