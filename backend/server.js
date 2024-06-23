import express from "express";
import dotenv from "dotenv";

import connectToDB from "./db/connectToDB.js";
import authRoutes from "./routes/auth.routes.js"

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
    connectToDB();
})