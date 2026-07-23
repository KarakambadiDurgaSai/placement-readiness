const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret not configured" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      if (user.isBlocked) {
        return res
          .status(403)
          .json({ message: "Your account is blocked by admin" });
      }

      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = {
        userId: user._id,
        role: user.role,
      };

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ message: "Authentication failed" });
    }
  };
};

module.exports = authMiddleware;
