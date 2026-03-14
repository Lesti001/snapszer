const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auth = sequelize.define('Auth', {
  id: { 
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true
  },
  username: { 
    type: DataTypes.STRING, 
    unique: true,
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }
}, { 
  tableName: 'auth', 
  timestamps: false 
});

module.exports = Auth;