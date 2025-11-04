const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authcontroller");
const User = require("../models/user");

// Signup & Login
router.post("/register", register);
router.post("/login", login);

// 🔹 Get all clients (for admin dashboard)
router.get("/clients", async (req, res) => {
  try {
    const clients = await User.findAll({
      where: { role: "client" },
      attributes: [
        "id",
        "name",
        "email",
        "companyName",
        "companyAddress",
        "contactNumber",
      ],
    });
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔹 Update client details (for admin edit)
router.put("/client/:id", async (req, res) => {
  try {
    const { companyName, companyAddress, contactNumber } = req.body;
    const client = await User.findByPk(req.params.id);

    if (!client || client.role !== "client")
      return res.status(404).json({ message: "Client not found" });

    await client.update({ companyName, companyAddress, contactNumber });
    res.status(200).json({ message: "Client updated successfully", client });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
