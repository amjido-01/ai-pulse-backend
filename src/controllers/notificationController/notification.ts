import { Response, Request } from "express";
import prisma from "../../config/db";

export const notification = async (req: Request, res: Response): Promise<any> => {
    let userData = await (req as any)?.user;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userData?.id
            },
            select: {
                notifications: true
            }   
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          console.log(user, "hello")

        res.json({ notifications: user.notifications, user });
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
   
}