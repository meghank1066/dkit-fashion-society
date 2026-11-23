import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";


// Uploads go straight to Cloudinary instead of the server's disk.
// Render's disk is wiped whenever the server sleeps or redeploys,
// which is why images used to vanish after a while.
const storage = new CloudinaryStorage({

    cloudinary,

    params: {
        folder: "dkit-fashion-society",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },

});


const upload = multer({

    storage,

    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB

    fileFilter:(req,file,cb)=>{

        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
        ];


        if(allowed.includes(file.mimetype)){

            cb(null,true);

        }else{

            cb(new Error("Only images allowed"));

        }

    }

});


export default upload;
