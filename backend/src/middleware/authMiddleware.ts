// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "superje_jwt_secret_2025",
    (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Forbidden: Invalid or expired token" });
      }
      req.user = user as JwtPayload;
      next();
    }
  );
};

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user?.role || "")) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
