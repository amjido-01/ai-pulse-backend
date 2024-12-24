import { Response, Request } from "express";
import bcrypt from "bcrypt";
import prisma from "../../config/db";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwtUtils";

export const login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    // console.log(req.cookies.refreshToken)

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide all inputs one" });
        }

        // Find the user by email
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        // Check if the user exists
        if (!existingUser) {
            return res.status(403).json({ message: "Invalid login credentials" });
        }

        // Verify password
        // const salt = bcrypt.genSaltSync(10);
        const validPassword = await bcrypt.compare(password, existingUser.password)
        if (!validPassword) {
            return res.status(403).json({ message: "Invalid login credentials" });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            id: existingUser.id,
            email: existingUser.email
        });

        const refreshToken = generateRefreshToken({
            id: existingUser.id,
            email: existingUser.email
        })

        console.log(refreshToken, "from login")
        await prisma.user.update({
            where: {id: existingUser.id},
            data: {refreshToken: refreshToken}
        })

       res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    //   secure: process.env.NODE_ENV === 'production',
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });


        // Send tokens as response
        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            responseBody: existingUser
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "An error occurred during login" });
    }
};
// 5bcb88d58ff9