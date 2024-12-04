import { Response, Request } from "express";
import prisma from "../../config/db";

export const getUser = async (req: Request, res: Response): Promise<any> => {
    const {id} = req.params

  try {

    const user = await prisma.user.findUnique({
      where: {
        id
      }
    })
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user data
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching the user' });
  }
};