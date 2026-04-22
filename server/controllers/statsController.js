const jwt = require('jsonwebtoken');
const db = require('../models');

exports.getStats = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Nincs token!' });

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const stats = await db.Stats.findOne({ where: { player_id: decoded.playerId } });
    
    const history = await db.History.findAll({
      where: { player_id: decoded.playerId },
      order: [['match_date', 'DESC']],
      limit: 10
    });

    res.status(200).json({ stats, history });
  } catch (error) {
    console.error('Hiba a statisztika lekérésekor:', error);
    res.status(403).json({ message: 'Érvénytelen vagy lejárt token!' });
  }
};