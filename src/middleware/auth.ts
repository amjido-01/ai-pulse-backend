import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.refreshToken;
  // console.log(token, "from middleware")

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return
  }
  try {
    const user = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
    if (user) {
        (req as any).user = user;
        next();
    }
  } catch (error) { 
    res.status(403).json({ message: 'Invalid or expired token' });
    return
  }
};
