const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Product = db.define('Product', {
  item_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  item_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  item_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  item_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  item_rate: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;
