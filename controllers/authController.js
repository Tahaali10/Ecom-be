const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const InvalidToken = require('../models/invalidToken'); 

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Generate JWT with 2 hours expiration
const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '2h',  // Token expires in 2 hours
  });
};

// Register a new user with username, password, and email
exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  // Simple validation checks
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Please provide all required fields: username, password, and email.' });
  }

  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  if (username === ADMIN_USERNAME) {
    return res.status(400).json({ message: 'Admin registration not allowed here.' });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if the email is already registered
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create the new user and let the `pre-save` hook handle password hashing
    const user = new User({ username, password, email, isAdmin: false });
    await user.save();

    // Return the user's data along with the token
    res.status(201).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id, false),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in user registration');
  }
};

// Login the user (admin or regular user)
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Check if the login is for an admin user
  if (username === ADMIN_USERNAME) {
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    console.log('Admin login attempt:', { username, isMatch });
    
    if (isMatch) {
      return res.json({
        _id: 'admin',
        username,
        isAdmin: true,
        token: generateToken('admin', true),
      });
    } else {
      console.log('Invalid admin credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    try {
      // Check for regular user
      const user = await User.findOne({ username });
      console.log('User found:', user);

      if (user) {
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match check:', { username, isMatch });

        if (isMatch) {
          console.log('Password matched successfully');

          // Invalidate any previous token
          const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
          if (token) {
            console.log('Invalidating previous token:', token);
            await InvalidToken.create({ token });
          }

          return res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id, user.isAdmin),
          });
        } else {
          console.log('Invalid user credentials');
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        console.log('User not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error during login process:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
};

// Logout and invalidate the token
exports.logout = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  await InvalidToken.create({ token });
  res.json({ message: 'Logged out successfully' });
};
