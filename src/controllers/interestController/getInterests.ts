import { Response, Request } from "express";
import prisma from "../../config/db";

export const getUserIntersts = async (req: Request, res: Response): Promise<any> => {
    let userData = await (req as any)?.user
    try {
        const user = await prisma.user.findUnique({
          where: { id: userData?.id },
          select: { interest: true, }
        });
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.json({ interest: user.interest, user });
      } catch (error) {
        console.error('Error fetching user intersts:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
}