import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n mongodb connected. db host: ${connection.connection.host}`)
    } catch (error) {
        console.log("error in connecting the database", error);
        process.exit(1);
    }
}

export default connectDB;