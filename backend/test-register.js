require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');
    
    // Clear existing test user
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Cleared old test user');
    
    // Test creating a user
    console.log('Creating test user...');
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    await user.save();
    console.log('✅ User created successfully:', {
      id: user._id,
      name: user.name,
      email: user.email,
      hashedPassword: user.password.substring(0, 20) + '...'
    });
    
    // Test finding user
    const found = await User.findOne({ email: 'test@example.com' });
    console.log('✅ User found:', found.email);
    
    // Test bcrypt compare
    const bcrypt = require('bcryptjs');
    const match = await bcrypt.compare('password123', found.password);
    console.log('✅ Password match:', match);
    
    await mongoose.disconnect();
    console.log('✅ All tests passed!');
  } catch (err) {
    console.error('❌ Error:', {
      message: err.message,
      code: err.code,
      name: err.name
    });
  }
}

test();
