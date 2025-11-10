const express = require("express");
const router = express.Router();
const {
  createBill,
  getBills,
  getBillsHistory,   // ✅ make sure ye import ho raha hai
  getBillById,
  getClientDetails,
  getProductDetails,
  getClientByName,
} = require("../controllers/billController");

// 🔍 Search route — ye sabse upar rahe
router.get("/search", getClientByName);

// 👤 Auto-fill routes
router.get("/client/details", getClientDetails);
router.get("/product/details", getProductDetails);

// 🧾 Bill routes
router.post("/create", createBill);
router.get("/all", getBills);

// ✅ History route (ye /:id se PEHLE likhni hai)
router.get("/history", getBillsHistory);

// 👇 YE sabse last me rakho, warna conflict karega
router.get("/:id", getBillById);

module.exports = router;
