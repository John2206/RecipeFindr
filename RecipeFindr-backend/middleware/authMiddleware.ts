// middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any; // You can define a more specific user type if needed
}

const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // Add user payload to request object (e.g., { id: userId })
    next();
  } catch (error: any) {
    console.error('❌ Invalid token:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

export default verifyToken;
