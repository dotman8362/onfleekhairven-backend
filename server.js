import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ROUTES
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import blockedMonthRoutes from "./routes/blockedMonth.js";

dotenv.config();




const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors({
  origin: "https://onfleekhairven.co.uk", // temporary (we'll lock it later)
}));
app.use(express.json());

/* ======================
   ES MODULE PATH FIX
====================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================
   SERVE FRONTEND (DEV)
====================== */
app.use(express.static(path.join(__dirname, "..", "frontend")));

/* ======================
   API ROUTES
====================== */
app.use("/api", bookingRoutes);
app.use("/api", adminRoutes);
app.use("/api", availabilityRoutes);
app.use("/api", blockedMonthRoutes);



/* ======================
   DATABASE
====================== */
// One-line connection


const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://adedotunjeremiah836:6YY6BD3YQIKAURC6@ac-vy0qvdz.zodmfur.mongodb.net/booking?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

// Call the function
connectDB();
// mongoose.connect('mongodb://adedotunjeremiah836:6YY6BD3YQIKAURC6@ac-vy0qvdz-shard-00-00.zodmfur.mongodb.net:27017/booking?authSource=admin&ssl=true')
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ Error:', err.message));



/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
