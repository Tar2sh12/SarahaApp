import mongoose from "./global-setup.js";
export const db_connection = async ()=>{
    try {
         await mongoose.connect(process.env.MONGO_URI)
        console.log("connected successfully ");
    } catch (error) {
        console.log("Error in db connection",error);
    }
}