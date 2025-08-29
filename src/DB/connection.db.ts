import mongoose from "mongoose";
import { UserModel } from "./models/User.model";

const connectDB = async () => {
  try {
    const uri = process.env.DB_URI;
    if (!uri) {
      throw new Error("DB_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS:1000
    });
    await UserModel.syncIndexes()
    console.log(`✅ DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Failed to connect to DB", error);
    process.exit(1);
  }
};

export default connectDB;
