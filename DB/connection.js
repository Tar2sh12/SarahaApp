import mongoose from "./global-setup.js";
import { User } from "./models/user.model.js";
import bcrypt from "bcrypt";
export const db_connection = async ()=>{
    try {
         await mongoose.connect(process.env.MONGO_URI)
        console.log("connected successfully ");
        // const users = [
        //     {
        //         userName: 'admin1',
        //         email: 'admin1@gmail.com',
        //         password: '123123',
        //         userType: 'Admin',
        //         otp:"xrb27m"
        //     },
        //     {
        //         userName: 'admin2',
        //         email: 'admin2@gmail.com',
        //         password: '123123',
        //         userType: 'Admin',
        //         otp:"1nm3b4"
        //     }
        // ];

        // for (let user of users) {
        //     const existingUser = await User.findOne({ email: user.email });
        //     if (!existingUser) {
        //         await User.create(user);
        //         console.log(`Seeded user: ${user.userName}`);
        //     } else {
        //         console.log(`User ${user.email} already exists`);
        //     }
        // }
    } catch (error) {
        console.log("Error in db connection");
    }
}