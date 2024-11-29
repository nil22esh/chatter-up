import mongoose from "mongoose";
import colors from "colors";

const dbConnection = () =>
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to ChatterUp MongoDB Database!".bgMagenta);
    })
    .catch((err) => {
      console.error(`Failed to connect to MongoDB: ${err.message}`);
    });

export default dbConnection;
