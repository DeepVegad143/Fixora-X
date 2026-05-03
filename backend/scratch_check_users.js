const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const emails = ['demouser@fixorax.com', 'demomech@fixorax.com', 'admin@fixorax.com'];
    for (const email of emails) {
      const user = await User.findOne({ email }).select('+passwordHash');
      if (user) {
        console.log(`User: ${user.email}, Role: ${user.role}, Verified: ${user.isVerified}, Active: ${user.isActive}`);
      } else {
        console.log(`User: ${email} NOT FOUND`);
      }
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUsers();
