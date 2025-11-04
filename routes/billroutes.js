const express = require("express");
const router = express.Router();

// Import all controller functions
const {
  createBill,
  getBills,
  getBillById,
  getClientDetails,
  getProductDetails,
  searchClients,
  getClientByName
} = require("../controllers/billController");

// 🧾 Bill routes
router.post("/create", createBill);
router.get("/all", getBills);
router.get("/:id", getBillById);

// 👤 Auto-fill routes
router.get("/client/details", getClientDetails);
router.get("/product/details", getProductDetails);

// 🔍 Search routes
router.get("/search-clients", searchClients);
router.get("/search", getClientByName);

module.exports = router;
