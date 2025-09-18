const express = require("express");
const controller = require("../controllers/auth.controller");
const middleware = require("../middleware/auth.middleware");

const router = express.Router();

// User Authentication Routes
router.post("/user/register", controller.registerUser);
router.post("/user/login", controller.loginUser);
router.post("/admin/register", controller.registerAdmin);
router.post("/admin/login", controller.loginAdmin);
router.post("/user/otp", controller.otpVerification);

module.exports = router;
