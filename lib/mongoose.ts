import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGO_URL) {
    return console.log("MONGO_URL is missing");
  }
  if (isConnected) {
    return console.log("Already connected to the database");
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    isConnected = true;
    console.log("Connected to database");
  } catch (error) {
    console.log(error);
  }
};
