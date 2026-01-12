const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.register = async (req, res) => {
  try {
    console.log('📝 Register attempt:', { email: req.body.email, name: req.body.name });
    
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Create user (password hashing is handled in User model)
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password 
    });
    await user.save();

    // Create Token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User registered:', user.email);
    res.status(201).json({ 
      message: 'Account created successfully',
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('❌ Register Error:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    // Return detailed error for easier debugging in development
    res.status(500).json({ message: 'Server error: ' + err.message, error: err.stack });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Check user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Sanity logs for debugging
    console.log('🔍 User found for login:', { id: user._id.toString(), email: user.email });
    console.log('🔐 Checking password hash presence:', { hasPassword: !!user.password, hashLength: user.password ? user.password.length : 0 });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Ensure JWT secret available
    if (!process.env.JWT_SECRET) {
      console.error('❌ Missing JWT_SECRET environment variable');
      return res.status(500).json({ message: 'Server configuration error: JWT secret missing' });
    }

    // Create Token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in:', user.email);
    res.json({ 
      message: 'Login successful',
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error('❌ Login Error:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
    // Return detailed error stack in response to aid debugging during development
    res.status(500).json({ message: 'Server error: ' + err.message, error: err.stack });
  }
};