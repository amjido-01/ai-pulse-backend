import { Response, Request } from "express";
import prisma from "../../config/db";
export const logout = async (req: Request, res: Response): Promise<any> => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await prisma.user.updateMany({
          where: { refreshToken },
          data: { refreshToken: null },
        });
      }
    res.clearCookie("refreshToken")
    res.json({ message: 'Logged out successfully' });
};
