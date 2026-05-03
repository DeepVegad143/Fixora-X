const mongoose = require('mongoose');
const seedDemoUsers = require('./src/utils/seedDemo');
require('dotenv').config();

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await seedDemoUsers();
    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runSeed();
