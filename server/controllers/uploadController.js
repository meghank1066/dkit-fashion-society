export const uploadImage = async(req,res)=>{

    try{

        if(!req.file){

            return res.status(400).json({
                message:"No image uploaded"
            });

        }


        res.json({

            url:req.file.path

        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};