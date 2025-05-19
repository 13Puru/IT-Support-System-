import jwt from "jsonwebtoken";

/**
 * Verifies the token and returns decoded data or an error
 */
const verifyToken = (req) => {
  try {
    console.log("🟡 Checking token..."); // Debugging

    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.token ||
      (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ") &&
        req.headers.authorization.split(" ")[1]);

    if (!token) {
      console.log("🔴 No token found in request!");
      return { error: { status: 401, message: "Unauthorized: No token provided" } };
    }

    console.log("✅ Token received:", token);

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);
    
    return { decoded };
  } catch (error) {
    console.error("❌ Token Verification Error:", error);

    let message = "Invalid token";
    if (error.name === "TokenExpiredError") {
      message = "Token expired, please login again";
    } else if (error.name === "JsonWebTokenError") {
      message = "Malformed token";
    }

    return { error: { status: 403, message } };
  }
};

/**
 * General authentication middleware for all authenticated users
 */
export const authMiddleware = (req, res, next) => {
  try {
    console.log("🔵 Authorization Header:", req.headers.authorization); // Log received token
    
    const { decoded, error } = verifyToken(req);
    if (error) {
      console.error("🔴 Auth Error:", error.message);
      return res.status(error.status || 401).json({ success: false, message: error.message });
    }

    console.log("✅ Decoded Token:", decoded); // Log decoded token
    req.user = { user_id: decoded.id, role: decoded.role, isverified: decoded.isverified };
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Admin authentication middleware - allows access only to admins
 */
export const adminAuthMiddleware = (req, res, next) => {
  try {
    const { decoded, error } = verifyToken(req);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    if (decoded.role !== "admin" && decoded.role !== "agent") {
      return res.status(403).json({ success: false, message: "Forbidden: Admin/Agent access required" });
    }

    req.user = { user_id: decoded.id, role: decoded.role, isverified: decoded.isverified };
    next();
  } catch (error) {
    console.error("❌ Admin Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Agent authentication middleware - allows access only to agents
 */
export const agentAuthMiddleware = (req, res, next) => {
  try {
    const { decoded, error } = verifyToken(req);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    if (decoded.role !== "agent") {
      return res.status(403).json({ success: false, message: "Forbidden: Agent access required" });
    }

    req.user = { user_id: decoded.id, role: decoded.role, isverified: decoded.isverified };
    next();
  } catch (error) {
    console.error("❌ Agent Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
