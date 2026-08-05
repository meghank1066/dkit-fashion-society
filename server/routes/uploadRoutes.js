// import express from "express";
// import upload from "../middleware/upload.js";
// import protect from "../middleware/authMiddleware.js";

// const router = express.Router();


// router.post(
// "/",
// protect,
// upload.single("image"),

// (req,res)=>{


//     if(!req.file){

//         return res.status(400).json({
//             message:"No image uploaded"
//         });

//     }


//     // res.json({

//     //     url:`http://localhost:5000/uploads/${req.file.filename}`

//     // });

//     res.json({
//     url:`${process.env.API_URL}/uploads/${req.file.filename}`
// });

// });


// export default router;
import express from "express";
import upload from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("image"),

  (req,res)=>{

    if(!req.file){

      return res.status(400).json({
        message:"No image uploaded"
      });

    }

    res.json({
      url:`${process.env.API_URL}/uploads/${req.file.filename}`
    });

  }
);

export default router;