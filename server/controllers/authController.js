import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validatePassword from "../utils/passwordValidator.js";
import sendEmail from "../utils/sendEmail.js";

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



// FORGOT PASSWORD: email a reset link (valid 15 minutes, works once)
export const forgotPassword = async (req, res) => {
  const genericReply = {
    message: "If an account with that email exists, a password reset link has been sent. Check your spam folder too.",
  };

  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email });

    // Same reply either way, so nobody can use this to check who has an account
    if (!user) return res.status(200).json(genericReply);

    // Signed with the user's current password hash, so the link stops working once it's been used
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET + user.password, {
      expiresIn: "15m",
    });

    const siteUrl = (process.env.CLIENT_URL || "https://www.dkitfashionsociety.com").replace(/\/$/, "");
    const resetUrl = `${siteUrl}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your DkIT Fashion Society password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb;">
          <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #9ca3af; margin: 0;">DkIT Fashion Society</p>
          <h2 style="font-family: Georgia, serif; font-weight: normal; color: #011145; font-size: 28px; margin: 12px 0 16px;">Reset your password</h2>
          <p style="color: #4b5563; line-height: 1.6;">Hi ${user.username}, someone (hopefully you!) asked to reset your password. Click below to choose a new one.</p>
          <a href="${resetUrl}" style="background: #011145; color: #ffffff; padding: 12px 28px; text-decoration: none; display: inline-block; margin: 20px 0;">Reset password</a>
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">This link expires in 15 minutes and can only be used once. If you didn't ask for this, you can ignore this email and your password won't change.</p>
        </div>
      `,
    });

    res.status(200).json(genericReply);
  } catch (error) {
    console.error("Forgot password email error:", error);
    res.status(500).json({ message: "We couldn't send the reset email right now. Please try again in a few minutes." });
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

    // Find whose link it is, then check it with their current password hash
    // (so a link that's already been used, or is older than 15 minutes, is rejected)
    const unverified = jwt.decode(token);
    const user = unverified?.id ? await User.findById(unverified.id) : null;
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link. Please request a new one." });
    }
    jwt.verify(token, process.env.JWT_SECRET + user.password);

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired link. Please request a new one." });
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