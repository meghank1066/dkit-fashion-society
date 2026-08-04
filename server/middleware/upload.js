import multer from "multer";
import path from "path";


const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(null,"uploads/");

    },


    filename:(req,file,cb)=>{

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );

    }

});


const upload = multer({

    storage,

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