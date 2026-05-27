import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDatabaseErrorMessage } from "../config/database.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Signup successful",
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: getDatabaseErrorMessage(error), success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginId = (identifier || email || username || "").trim();

    if (!loginId) {
      return res.status(400).json({ message: "Email or username is required" });
    }

    const user = await User.findOne({
      $or: [{ email: loginId }, { name: loginId }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or username" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google or LinkedIn sign-in. Use that option instead.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};
