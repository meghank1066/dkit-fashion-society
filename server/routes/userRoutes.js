import express from "express";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

router.put("/:id/role", protect, async (req, res) => {
  try {
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-password" }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update role", error: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

// --- ADDED: Update User Profile Route ---
router.put("/update-profile", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // Matches your protect middleware user structure
    const { username, profilePic } = req.body;

    // Check if username is taken by someone else
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken by another user." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(username && { username }), 
        ...(profilePic !== undefined && { profilePic, profileImage: profilePic }) 
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

export default router;