import { Response, Request } from "express";
import bcrypt from "bcrypt"
import prisma from "../../config/db";

export const register = async (req: Request, res: Response): Promise<any> => {
    const {name, email, password} = req.body;
    try {

        if (!name || !email || !password) return res.status(400).json({message: "please provide all inputs, oo"})

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            return res.status(404).json({
                responseSuccessful: true,
                responseMessage: "This email has been registered already",
                responseBody: null
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        res.status(201).json({ 
            responseSuccessful: true,
            responseMessage: 'User created successfully',
            responseBody: user
        });

    } catch (error) {
        res.status(500).json({
            responseSuccessful: false,
            responseMessage: error,
            responseBody: null
        });
    }
}