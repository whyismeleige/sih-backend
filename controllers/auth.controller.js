const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");
const sendOTP = require("../Utils/Email-Sender/email-sender");
const geoip = require("geoip-lite");
const ua = require("ua-parser-js");
require("dotenv").config();

const User = db.user;
const OTPVerification = db.otpVerification;

// Token Generations
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

const getMetaData = (req) => {
  const ipAddress =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  const userAgent = req.headers["user-agent"];

  const geo = geoip.lookup(ipAddress);

  const parser = new ua(userAgent);

  return {
    ipAddress,
    userAgent,
    browser: parser.getBrowser(),
    os: parser.getOS(),
    device: parser.getDevice(),
    location: geo
      ? {
          country: geo.country,
          region: geo.region,
          city: geo.city,
          latitude: geo.ll[0],
          longitude: geo.ll[1],
          timezone: geo.timezone,
        }
      : null,
  };
};

const loginUser = async (user, metadata) => {
  user.removeExpiredTokens();

  const payload = { userId: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens.push({ token: refreshToken, deviceInfo: metadata });
  await user.save();

  return { accessToken, refreshToken };
};

// Register New User
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).send({ message: "All fields are required " });

    if (password.length < 8)
      return res.status(400).send({
        message: "Password must be atleast 8 characters",
        type: "error",
      });

    const existingUser = await User.findByEmail(email);

    if (existingUser)
      return res
        .status(400)
        .send({ message: "User already exists", type: "error" });

    const userData = { "profile.userName": username, email, password };

    if (role && role !== "student") userData.role = role;

    const user = new User(userData);
    await user.save();

    res.status(200).send({
      message: "User created successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error while Registering New User", error);

    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .send({ message: "Email and Password are required", type: "error" });

    const user = await User.findByEmailWithPassword(email);

    if (!user)
      return res.status(400).send({
        message: "User does not exist",
        type: "error",
      });

    if (user.isLoginLocked()) {
      return res.status(400).send({
        message: "Max Attempts Reached, Try Again after 5 minutes",
        type: "error",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.inCorrectLogin();
      return res.status(400).send({
        message: "Invalid Credentials, Try Again",
        type: "error",
      });
    }

    const metadata = getMetaData(req);

    if (user.isTwoFactorEnabled()) {
      const { otp } = await OTPVerification.createVerification(email, metadata);

      await sendOTP(email, otp);

      return res.status(200).send({
        message: "Successfully sent OTP to Registered Email",
        type: "success",
      });
    }

    const { accessToken, refreshToken } = await loginUser(user, metadata);

    await user.successfulLogin(metadata);

    res.status(200).send({
      message: "Login Successful",
      type: "success",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error", error);
    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .send({ message: "Email and Password are required", type: "error" });

    const user = await User.findByEmailWithPassword(email);

    if (!user)
      return res.status(400).send({
        message: "User does not exist",
        type: "error",
      });

    if (user.isLoginLocked()) {
      return res.status(400).send({
        message: "Max Attempts Reached, Try Again after 5 minutes",
        type: "error",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.inCorrectLogin();
      return res.status(400).send({
        message: "Invalid Credentials, Try Again",
        type: "error",
      });
    }

    const metadata = getMetaData(req);

    if (user.isTwoFactorEnabled()) {
      const { otp } = await OTPVerification.createVerification(email, metadata);

      await sendOTP(email, otp);

      return res.status(200).send({
        message: "Successfully sent OTP to Registered Email",
        type: "success",
      });
    }

    const { accessToken, refreshToken } = await loginUser(user, metadata);

    await user.successfulLogin(metadata);

    res.status(200).send({
      message: "Login Successful",
      type: "success",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error", error);
    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};

// Register Adming
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).send({ message: "All fields are required " });

    if (password.length < 8)
      return res.status(400).send({
        message: "Password must be atleast 8 characters",
        type: "error",
      });

    const existingUser = await User.findByEmail(email);

    if (existingUser)
      return res
        .status(400)
        .send({ message: "User already exists", type: "error" });

    const userData = { "profile.userName": username, email, password };

    if (role && role !== "student") userData.role = role;

    const user = new User(userData);
    await user.save();

    res.status(200).send({
      message: "User created successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error while Registering New User", error);

    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};

// OTP Verification
exports.otpVerification = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { isValid, attempts, maxAttemptsReached } =
      await OTPVerification.verifyOTP(email, otp);

    if (!isValid)
      return res.status(400).send({
        message: "Invalid OTP",
        type: "error",
      });

    const user = await User.findByEmail(email);

    if (!user)
      return res.status(400).send({
        message: "User does not exist",
        type: "error",
      });

    const metadata = getMetaData(req);

    const { accessToken, refreshToken } = await loginUser(user, metadata);

    await user.successfulLogin(metadata, attempts, maxAttemptsReached);

    res.status(200).send({
      message: "Login Successful",
      type: "success",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error while OTP Verification", error);
    res.status(500).send({
      message: "Server Error",
      type: "error",
    });
  }
};
