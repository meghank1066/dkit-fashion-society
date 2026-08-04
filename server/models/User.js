// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//     {
//         username: {
//             type: String,
//             required: true,
//             unique: true
//         },

//         email: {
//             type: String,
//             required: true,
//             unique: true
//         },

//         password: {
//             type: String,
//             required: true
//         },

//         role: {
//             type: String,
//             default: "user"
//         },

//         profileImage: {
//             type: String,
//             default: ""
//         },
        
//     },
//     {
//         timestamps: true
//     }
// );


// const User = mongoose.model("User", userSchema);

// export default User;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "user" },
        profileImage: { type: String, default: "" },
    },
    { timestamps: true }
);

// Forces Mongoose to use the exact "users" collection inside "fashionSociety"
const User = mongoose.model("User", userSchema, "users");

export default User;