const sequelize = require('../config/database');

const Auth = require('./Auth');
const Player = require('./Player');
const Stats = require('./Stats');
const History = require('./History');

Auth.hasOne(Player, { foreignKey: 'auth_id', onDelete: 'CASCADE' });
Player.belongsTo(Auth, { foreignKey: 'auth_id' });

Player.hasOne(Stats, { foreignKey: 'player_id', onDelete: 'CASCADE' });
Stats.belongsTo(Player, { foreignKey: 'player_id' });

Player.hasMany(History, { foreignKey: 'player_id', onDelete: 'CASCADE' });
History.belongsTo(Player, { foreignKey: 'player_id' });


module.exports = { 
  sequelize, 
  Auth, 
  Player, 
  Stats, 
  History 
};