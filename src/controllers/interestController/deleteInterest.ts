import { Response, Request } from "express";
import prisma from "../../config/db";

export const deleteInterest = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    let userData = await (req as any)?.user;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userData?.id
            },
            include: {
                interest: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the interest exists
        const interestToDelete = await prisma.interest.findUnique({
            where: { id: parseInt(id) } // Ensure the ID is parsed correctly
        });

        if (!interestToDelete) {
            return res.status(404).json({ message: 'Interest not found' });
        }

        // Delete the interest from the database
        await prisma.interest.delete({
            where: { id: parseInt(id) }
        });

        // Fetch the updated user interests
        const updatedUser = await prisma.user.findUnique({
            where: { id: userData?.id },
            include: { interest: true }
        });

        // Respond with the updated user data
        res.status(200).json({ user: updatedUser, message: 'Interest deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the interest' });
    }
};
