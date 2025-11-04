const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Product = require("./product");

const Bill = db.define(
  "Bill",
  {
    bill_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    client_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    client_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "item_id",
      },
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cgst: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    sgst: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "bills",
    timestamps: true,
  }
);

// Relation (optional)
Bill.belongsTo(Product, { foreignKey: "item_id" });

module.exports = Bill;
