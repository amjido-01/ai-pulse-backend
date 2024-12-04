import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.refreshToken;
  const tokenTwo = req.headers.cookie
  console.log(token, "from middleware")
  console.log(tokenTwo , "second token")

  if (!tokenTwo) {
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
