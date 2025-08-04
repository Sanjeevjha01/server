import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connected ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`Mongodb error ${error}`.bgRed.white);
  }
};

export default connectDB;
