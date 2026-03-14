const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stats = sequelize.define('Stats', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  total_games: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  total_wins: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  total_points: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  }
}, { 
  tableName: 'stats', 
  timestamps: false 
});

module.exports = Stats;