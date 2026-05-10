const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Borrow = sequelize.define('Borrow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'members', key: 'id' },
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'books', key: 'id' },
  },
  borrowDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('active', 'returned', 'overdue'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  tableName: 'borrows',
  timestamps: true,
});

module.exports = Borrow;
