const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

exports.authenticateUserToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Unauthorized Access", type: "error" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-refreshToken");

    if (!user)
      return res.status(400).json({
        message: "User not found",
        type: "error",
      });

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).send({
      message: "Unauthorized Access",
      type: "error",
    });
  }
};

exports.authenticateAdminToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Unauthorized Access", type: "error" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-refreshToken");

    if (!user)
      return res.status(400).json({
        message: "User not found",
        type: "error",
      });

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).send({
      message: "Unauthorized Access",
      type: "error",
    });
  }
}

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({
        message: "Access Forbidden",
        type: "error",
      });
    }
    next();
  };
};