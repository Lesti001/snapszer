const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const History = sequelize.define('History', {
  match_id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true 
  },
  player_id: {
    type:DataTypes.UUID,
    allowNull: false
  },
  match_date: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  opponent_name: {
    type: DataTypes.STRING,
  },
  match_status: { //WON OR LOST 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  final_score: {
    type: DataTypes.STRING,
  }
}, { 
  tableName: 'history',
  timestamps: false 
});

module.exports = History;