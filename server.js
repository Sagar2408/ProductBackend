const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const authRoutes = require("./routes/authroutes");
const productRoutes = require("./routes/productroutes");
const billRoutes = require("./routes/billroutes");
const cors = require("cors");

dotenv.config();

const app = express();

// ✅ Enable CORS
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Parse JSON requests
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bills", billRoutes);

// ✅ Sync Database (with alter:true for auto column update)
sequelize
  .sync({ alter: true }) // <-- this ensures new columns auto-update without dropping tables
  .then(() => console.log("✅ Database synchronized successfully"))
  .catch((err) => console.error("❌ Database synchronization error:", err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
