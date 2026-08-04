import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validatePassword from "../utils/passwordValidator.js";

export const register = async (req, res) => {

    try {

        const { username, email, password } = req.body;


        const existingUser = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        });


        if (existingUser) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }
if (!validatePassword(password)) {

    return res.status(400).json({

        message:
        "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number and special character."

    });

}

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });


        res.status(201).json({
            message: "User created",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });


    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const login = async (req, res) => {

    try {

        const { email, password } = req.body;


        const user = await User.findOne({ email });


        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }


        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }


        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );


        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });


    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const getMe = async (req, res) => {

    try {

        res.json({
            user: req.user
        });

    } catch(error){

        res.status(500).json({
            message: error.message
        });

    }

};




export const changePassword = async (req, res) => {

    try {

        const { currentPassword, newPassword } = req.body;
        
        if (!validatePassword(newPassword)) {

    return res.status(400).json({

        message:
        "New password must be at least 8 characters and contain an uppercase letter, lowercase letter, number and special character."

    });

}


        const user = await User.findById(req.user._id);


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );


        if (!passwordMatch) {

            return res.status(400).json({
                message: "Current password is incorrect"
            });

        }


        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );


        user.password = hashedPassword;


        await user.save();


        res.json({
            message: "Password changed successfully"
        });


    } catch(error){

        res.status(500).json({
            message: error.message
        });

    }

};