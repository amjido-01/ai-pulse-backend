import { Response, Request } from "express";
import prisma from "../../config/db";

export const setUserFrequency = async (req: Request, res: Response): Promise<any> => {
    let userData = await (req as any)?.user
    const { frequency } = req.body;

    if (!frequency) {
        return res.status(400).json({ message: 'Frequency is required' });
      }

      const validFrequencies = ['daily', 'twice-weekly', 'weekly', 'bi-weekly', 'monthly'];
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({ message: 'Invalid frequency' });
      }

      try {
        const user = await prisma.user.update({
            where: { id: userData?.id },
            data: { frequency: frequency },
            select: { frequency: true }
          });

          res.json({ frequency: user.frequency, user });
      } catch (error) {
        console.error('Error updating notification frequency:', error);
        res.status(500).json({ message: 'Internal server error' });
      }

}