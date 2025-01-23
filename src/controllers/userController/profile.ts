import { Response, Request } from "express";
import prisma from "../../config/db";
export const profile = async (req: Request, res: Response): Promise<any> => {
    let userData = await (req as any)?.user
    console.log(userData, "from backend profile")
    try {
        const user = await prisma.user.findUnique({
            where: {id: userData.id},
            include: {
                interest: true,
                notifications: true
            }
        })
        console.log("hello", user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          res.json({user, message: "This is a protected route"});
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}