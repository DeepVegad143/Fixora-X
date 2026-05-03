const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'admin@fixorax.com';
    const password = 'Admin123!';
    
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      console.log('Admin user not found');
      process.exit(1);
    }
    
    const isMatch = await user.comparePassword(password);
    console.log(`Login test for ${email}: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
    if (!isMatch) {
        console.log('Password hash in DB:', user.passwordHash);
        // Let's see what it should be
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password, salt);
        console.log('New hash for same password would be:', hash);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testLogin();
