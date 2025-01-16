import { Response, Request } from "express";
import prisma from "../../config/db";


export const interests = async (req: Request, res: Response): Promise<any> => {
    let userData = await (req as any)?.user
    
    try {
        const { interests } = req.body;

        
    if (!Array.isArray(interests) || interests.length === 0) {
        return res.status(400).json({ message: 'Interests must be a non-empty array' });
      }

      // First, remove all existing interests for the user
      let userId = userData?.id
      console.log(userId)
    await prisma.interest.deleteMany({
        where: { userId },
      });

       // Then, add the new interests
    const interest = await prisma.interest.createMany({
        data: interests.map(interest => ({
          userId,
          interest,
        })),
      });

      const getAllUserInterest = await prisma.user.findUnique({
        where: {id: userId},
        include: {
          interest: true
        }
      })

      console.log(interests,  "all")
      console.log(getAllUserInterest, "oooo")
      res.status(201).json({ message: 'Interests saved successfully', count: interest.count, responseBody: getAllUserInterest });

    } catch (error) {
        console.error('Error saving interests:', error);
        res.status(500).json({ message: 'An error occurred while saving interests' });
    }
}