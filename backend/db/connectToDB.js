import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to database");
    } catch (error) {
        console.log("Error while connecting to database ", error.message);
        process.exit(1);
    }
} 

export default connectToDB;