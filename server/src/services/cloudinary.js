import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async(localFilePath) =>{
    try{
        if(!localFilePath) return null;
        
        const fileExtension = localFilePath.split('.').pop().toLowerCase();
        
        // Define file types
        const isDocument = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(fileExtension);
        const isAudio = ['mp3', 'wav', 'ogg', 'mpa', 'm4a', 'wma', 'flac', 'aac'].includes(fileExtension);
        
        // Determine resource type based on file extension
        let resourceType = "image"; // default
        if (isDocument) {
            resourceType = "raw";
        } else if (isAudio) {
            resourceType = "video"; // Cloudinary uses "video" resource type for audio files
        }
        
        const originalFilename = path.basename(localFilePath);

        const stats = fs.statSync(localFilePath);
        console.log(`File size: ${stats.size} bytes`);

        const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: resourceType,
          public_id: path.parse(originalFilename).name,
          use_filename: true,
          unique_filename: false
        });

        fs.unlinkSync(localFilePath);
        return response;
    }catch(err){
        console.log("cloudinary upload failed : ", err)
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath)
        }
        return null
    }
}

export {uploadOnCloudinary}
