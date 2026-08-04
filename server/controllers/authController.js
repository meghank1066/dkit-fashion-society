import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validatePassword from "../utils/passwordValidator.js";
import nodemailer from "nodemailer";

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



// UPDATED FORGOT PASSWORD CONTROLLER
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal user existence for security, or send 404 if preferred
      return res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    // 1. Generate JWT Token valid for 15 mins
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 2. Build Reset Link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // 3. Configure Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 4. Send Email
    await transporter.sendMail({
      from: `"DkIT Fashion Society" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset. Click the button below to update your password:</p>
          <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; margin: 15px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 12px;">This link will expire in 15 minutes.</p>
        </div>
      `
    });

    res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent."
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number and special character."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash and update password
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token." });
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