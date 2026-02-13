const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const requestLogger = require("./middleware/logger");
const authMiddleware = require("./middleware/auth");
const { generateToken } = require("./utils/tokenGenerator");

const app = express();
const PORT = process.env.PORT || 3000;

// Session storage (in-memory)
const loginSessions = {};
const otpStore = {};

// Middleware
//app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
  res.json({
    challenge: "Complete the Authentication Flow",
    instruction:
      "Complete the authentication flow and obtain a valid access token.",
  });
});

// CHANGE 1: /auth/login endpoint
app.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const loginSessionId = Math.random().toString(36).substring(2, 15);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    loginSessions[loginSessionId] = {
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 1000,
    };

    otpStore[loginSessionId] = otp;

    console.log(`[OTP] ${otp} for session ${loginSessionId}`);

    return res.json({
      message: "OTP generated",
      loginSessionId,
    });
  } catch {
    return res.status(500).json({ error: "Login failed" });
  }
});

app.post("/auth/verify-otp", (req, res) => {
  try {
    const { loginSessionId, otp } = req.body;

    const session = loginSessions[loginSessionId];

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    if (Date.now() > session.expiresAt) {
      return res.status(401).json({ error: "Session expired" });
    }

    if (otp !== otpStore[loginSessionId]) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    res.cookie("sessionId", loginSessionId, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    delete otpStore[loginSessionId];

    return res.json({ message: "OTP verified" });
  } catch {
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

app.post("/auth/token", (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({ error: "Session cookie missing" });
    }

    const session = loginSessions[sessionId];

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const accessToken = jwt.sign(
      { email: session.email },
      process.env.JWT_SECRET || "default-secret-key",
      { expiresIn: "15m" }
    );

    return res.json({
      access_token: accessToken,
      expires_in: 900,
    });
  } catch {
    return res.status(500).json({ error: "Token generation failed" });
  }
});

// Protected route example
app.get("/protected", authMiddleware, (req, res) => {
  return res.json({
    message: "Access granted",
    user: req.user,
    success_flag: `FLAG-${Buffer.from(req.user.email + "_COMPLETED_ASSIGNMENT").toString('base64')}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
