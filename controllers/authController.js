const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const {
  createUser,
  findUserByEmail,
  findUserByToken,
  verifyUserEmail,
} = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const dotenv = require('dotenv');

dotenv.config();

const register = async (req, res) => {
  const { full_name, email, password } = req.body;
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email уже зарегистрирован' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    await createUser(full_name, email, hashedPassword, verificationToken);
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Подтверждение регистрации',
      `Подтвердите свою почту по ссылке: ${verificationLink}`,
    );
    res.status(201).json({
      message: 'Регистрация успешна, проверьте почту для подтверждения',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await findUserByToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Неверный или истекший токен' });
    }
    await verifyUserEmail(token);
    res.status(200).json({ message: 'Email успешно подтвержден' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }
    if (!user.is_verified) {
      return res.status(400).json({ message: 'Подтвердите свой email' });
    }
    const token = jwt.sign(
      { userId: user.id, fullName: user.full_name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = { register, verifyEmail, login };
