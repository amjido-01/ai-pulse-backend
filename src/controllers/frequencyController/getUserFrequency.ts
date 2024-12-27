import { Response, Request } from "express";
import prisma from "../../config/db";

export const getUserFrequency = async (req: Request, res: Response): Promise<any> => {
    let userData = await (req as any)?.user
    console.log("hello  from frequency")
    try {
        const user = await prisma.user.findUnique({
          where: { id: userData?.id },
          
          // select: { frequency: true, }
        });
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.json({ frequency: user.frequency, user });
      } catch (error) {
        console.error('Error fetching notification frequency:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
}