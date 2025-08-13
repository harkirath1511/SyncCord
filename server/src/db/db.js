import mongoose from "mongoose";
import {db_name} from '../../constants/constants.js'

const connectToDb = async ()=>{
    try {
        const response = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
        console.log("Mongo Db connected successfully , DB HOST : ", response.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}

export  {connectToDb}
