const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware"); // ✅ for protected routes

const {
  createBill,
  getBills,
  getBillsHistory,
  getBillById,
  getClientDetails,
  getProductDetails,
  getClientByName,
  getClientBills, // ✅ new controller for client’s personal bills
} = require("../controllers/billcontroller");

// 🔍 Search route — always keep this at top
router.get("/search", getClientByName);

// 👤 Auto-fill routes
router.get("/client/details", getClientDetails);
router.get("/product/details", getProductDetails);

// 🧾 Bill routes (Admin & Common)
router.post("/create", createBill);
router.get("/all", getBills);
router.get("/history", getBillsHistory); // ✅ Admin full bill history

// 👤 Client-specific route (Protected)
router.get("/my-bills", authMiddleware, getClientBills); // ✅ client can view only their own bills

// 📄 Get single bill (keep at the bottom)
router.get("/:id", getBillById);

module.exports = router;
