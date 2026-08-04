import mongoose from "mongoose";


const postSchema = new mongoose.Schema(
    {

        title: {
            type: String,
            required: true
        },


        subtitle: {
            type: String,
            default: ""
        },


        coverImage: {
            type: String,
            default: ""
        },


        content: {
            type: String,
            required: true
        },


        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        category: {
            type: String,
            default: "announcement"
        }

    },
    {
        timestamps: true
    }
);



const Post = mongoose.model("Post", postSchema);


export default Post;