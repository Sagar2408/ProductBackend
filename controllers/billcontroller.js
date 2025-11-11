const { Op } = require("sequelize");
const Bill = require("../models/bill");
const Product = require("../models/product");
const User = require("../models/user");

// 🧾 Create Bill
exports.createBill = async (req, res) => {
  try {
    const {
      client_id,
      client_name,
      client_email,
      client_phone,
      item_id,
      quantity,
      cgst,
      sgst,
      payment_method,
    } = req.body;

    // 1️⃣ Validate Product
    const product = await Product.findByPk(item_id);
    if (!product) return res.status(404).json({ message: "Product not found!" });

    // 2️⃣ Check Stock
    if (quantity > product.item_quantity) {
      return res.status(400).json({
        message: `Only ${product.item_quantity} kg available in stock!`,
      });
    }

    // 3️⃣ Fetch Client (if existing)
    let finalClient = {};
    if (client_id) {
      const client = await User.findByPk(client_id);
      if (!client) return res.status(404).json({ message: "Client not found!" });

      finalClient = {
        client_name: client.name,
        client_email: client.email,
        client_phone: client.contactNumber,
      };
    } else {
      finalClient = { client_name, client_email, client_phone };
    }

    // 4️⃣ Calculate Total
    const baseAmount = product.item_rate * quantity;
    const cgstAmount = (baseAmount * (cgst || 0)) / 100;
    const sgstAmount = (baseAmount * (sgst || 0)) / 100;
    const totalAmount = baseAmount + cgstAmount + sgstAmount;

    // 5️⃣ Create Bill
    const bill = await Bill.create({
      client_name: finalClient.client_name,
      client_email: finalClient.client_email,
      client_phone: finalClient.client_phone,
      item_id,
      item_name: product.item_name,
      item_rate: product.item_rate,
      quantity,
      cgst,
      sgst,
      total_amount: totalAmount,
      payment_method,
    });

    // 6️⃣ Update Stock
    await product.update({
      item_quantity: product.item_quantity - quantity,
    });

    res.status(201).json({ message: "Bill created successfully ✅", bill });
  } catch (error) {
    console.error("Bill creation error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// 📄 Get All Bills
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(bills);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch bills", error: error.message });
  }
};

// 📋 Get Bill by ID
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found!" });
    res.status(200).json(bill);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bill", error: error.message });
  }
};

// 👤 Auto Fetch Client Details
exports.getClientDetails = async (req, res) => {
  try {
    const { value } = req.query;

    if (!value)
      return res
        .status(400)
        .json({ message: "Please provide client name, email or phone" });

    const client = await User.findOne({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${value}%` } },
          { email: { [Op.like]: `%${value}%` } },
          { contactNumber: { [Op.like]: `%${value}%` } },
        ],
      },
    });

    if (!client)
      return res.status(404).json({ message: "Client not found!" });

    res.status(200).json({
      name: client.name,
      email: client.email,
      phone: client.contactNumber,
      companyName: client.companyName,
      companyAddress: client.companyAddress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching client details", error: error.message });
  }
};

// 📦 Auto Fetch Product Details
exports.getProductDetails = async (req, res) => {
  try {
    const { item_id } = req.query;
    if (!item_id)
      return res.status(400).json({ message: "Please provide item ID" });

    const product = await Product.findByPk(item_id);
    if (!product)
      return res.status(404).json({ message: "Product not found!" });

    res.status(200).json({
      item_name: product.item_name,
      item_rate: product.item_rate,
      available_quantity: product.item_quantity,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product details", error: error.message });
  }
};

// 🔍 Client Autocomplete Search
exports.getClientByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Client name is required" });
    }

    const clients = await User.findAll({
      where: {
        role: "client",
        name: { [Op.like]: `%${name}%` },
      },
      attributes: [
        "id",
        "name",
        "email",
        "contactNumber",
        "companyName",
        "companyAddress",
      ],
      limit: 10,
    });

    if (clients.length === 0) {
      return res.status(404).json({ message: "No matching clients found" });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// 📜 Get Bill History (for admin)
exports.getBillsHistory = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      order: [["createdAt", "DESC"]], // latest first
      attributes: [
        "bill_id",
        "client_name",
        "client_email",
        "client_phone",
        "item_name",
        "item_rate",
        "quantity",
        "cgst",
        "sgst",
        "total_amount",
        "payment_method",
        "createdAt",
      ],
    });

    if (!bills || bills.length === 0) {
      return res.status(404).json({ message: "No bills found!" });
    }

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bill history:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 📦 Get Bills by Logged-in Client (Client Dashboard)
exports.getClientBills = async (req, res) => {
  try {
    // Token se user info aa rahi hai (authMiddleware se)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user found in token" });
    }

    // User verify karo
    const user = await User.findByPk(userId);
    if (!user || user.role !== "client") {
      return res.status(403).json({ message: "Access denied - Not a client" });
    }

    // Ab is user ke email ke hisaab se bill fetch karo
    const bills = await Bill.findAll({
      where: { client_email: user.email },
      order: [["createdAt", "DESC"]],
      attributes: [
        "bill_id",
        "item_name",
        "item_rate",
        "quantity",
        "cgst",
        "sgst",
        "total_amount",
        "payment_method",
        "createdAt",
      ],
    });

    if (bills.length === 0) {
      return res.status(200).json({ message: "No bills found for this client." });
    }

    res.status(200).json({ client: user.name, bills });
  } catch (error) {
    console.error("Error fetching client bills:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
