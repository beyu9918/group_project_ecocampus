// controllers/productController.js
import { DataTypes } from 'sequelize';
import { sequelize }  from '../config/database.js';

export const Product = sequelize.define('product', {
  productID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'productid'
  },
  productName: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'productname'
  },
  productPrice: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
    field: 'productprice'
  },
  productPicture: {
    type: DataTypes.TEXT,
    field: 'productpicture'
  },
  avgRating: {
    type: DataTypes.DECIMAL(2,1),
    field: 'avgrating'
  },
  category: {
    type: DataTypes.TEXT,
    field: 'category'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'description'
  }
}, {
  tableName: 'product',
  timestamps: false
});
