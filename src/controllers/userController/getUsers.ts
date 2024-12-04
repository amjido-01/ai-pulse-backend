import { Request, Response } from "express";
import prisma from "../../config/db";


export const getUsers = async (req: Request, res: Response): Promise<any> => {
    const users = await prisma.user.findMany()
    res.status(200).json(users)
    // res.status(200).json(users); // Return all users
  };