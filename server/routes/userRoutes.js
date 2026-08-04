// import express from "express";
// import User from "../models/User.js";

// const router = express.Router();

// // Temporarily remove middleware to test if users populate on the dashboard
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.find({}, "-password");
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching users", error: err.message });
//   }
// });

// router.put("/:id/role", async (req, res) => {
//   try {
//     const { role } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       { role },
//       { new: true, select: "-password" }
//     );
//     res.status(200).json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update role", error: err.message });
//   }
// });

// export default router;
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    console.log("👉 /api/users route was hit!"); // Check if this prints in your terminal
    const users = await User.find({}, "-password");
    console.log("👉 Users found in DB:", users); // Check if this prints actual users or []
    res.status(200).json(users);
  } catch (err) {
    console.log("👉 Error fetching users:", err.message);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

export default router;