const bcrypt = require('bcryptjs');
const { Auth, Player, sequelize } = require('../models');

exports.register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Felhasználónév és jelszó megadása kötelező!' });
  }

  try {
    const existingUser = await Auth.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ez a felhasználónév már foglalt!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await sequelize.transaction(async (t) => {
      const newAuth = await Auth.create({
        username,
        password: hashedPassword,
      }, { transaction: t });

      await Player.create({
        auth_id: newAuth.id,
        username: newAuth.username
      }, { transaction: t });
    });

    res.status(201).json({ message: 'Register success!' });

  } catch (error) {
    console.error('Error while register:', error);
    res.status(500).json({ message: 'Server issue.' });
  }
};

exports.login = async (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Felhasználónév és jelszó megadása kötelező!' });
  }

  try {
    const existingUser = await Auth.findOne({ where: { username } });

    if (!existingUser) {
      return res.status(400).json({ message: 'Hibás felhasználónév vagy jelszó!' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Hibás felhasználónév vagy jelszó!' });
    }

    const player = await Player.findOne({ where: { auth_id: existingUser.id } });

    const token = jwt.sign(
      { authId: existingUser.id, playerId: player.id, username: existingUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ 
      message: 'Login success!',
      token,
      user: {
        id: player.id,
        username: player.username
      }
    });

  } catch (error) {
    console.error('Error while login:', error);
    res.status(500).json({ message: 'Server issue.' });
  }
};