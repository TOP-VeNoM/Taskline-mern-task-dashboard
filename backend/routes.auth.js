// Everything about login/register lives here: the route AND the logic together
const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("./models");
const { protect } = require("./middleware");

const router = express.Router();

// Makes a login token that stays valid for JWT_EXPIRES_IN (default 7 days)
const makeToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register — create a new account
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Please fill in all fields" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password }); // password gets hashed automatically (see models.js)
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: makeToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong while registering", error: error.message });
  }
});

// POST /api/auth/login — check credentials, return a token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Please provide email and password" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ _id: user._id, name: user.name, email: user.email, token: makeToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong while logging in", error: error.message });
  }
});

// GET /api/auth/me — return the logged-in user (used to verify a stored token)
router.get("/me", protect, (req, res) => res.json(req.user));

module.exports = router;
