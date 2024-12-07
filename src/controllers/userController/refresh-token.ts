import { Response, Request } from "express"
import { generateAccessToken, generateRefreshToken } from "../../utils/jwtUtils";
import prisma from "../../config/db";
export const refreshToken = async (req: Request, res: Response): Promise<any | string> => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    try {
        const user = await prisma.user.findFirst({where: {refreshToken}})

        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
          }


          const newRefreshToken = generateRefreshToken({
            id: user.id,
            email: user.email
          })

          const accessToken = generateAccessToken({
            id: user.id,
            email: user.email
          })

          await prisma.user.update({
            where: {id: user.id},
            data: {refreshToken: newRefreshToken}
          })

          res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          })

          res.json({ accessToken })
    } catch (error) {
      console.error('Error during token refresh:', error);
      return res.status(500).json({ message: 'An error occurred while refreshing token' });
    }
}