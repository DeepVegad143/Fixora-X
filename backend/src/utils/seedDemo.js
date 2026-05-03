const User = require('../models/User');
const MechanicVerification = require('../models/MechanicVerification');
const logger = require('../config/logger');

const seedDemoUsers = async () => {
  try {
    const demoAccounts = [
      {
        name: 'Demo User',
        email: 'demouser@fixorax.com',
        phone: '1234567890',
        passwordHash: 'Demo123!',
        role: 'customer',
        isVerified: true
      },
      {
        name: 'Demo Mechanic',
        email: 'demomech@fixorax.com',
        phone: '1234567891',
        passwordHash: 'DemoMac123!',
        role: 'mechanic',
        isVerified: true
      },
      {
        name: 'Fixora Admin',
        email: 'admin@fixorax.com',
        phone: '1234567892',
        passwordHash: 'Admin123!',
        role: 'admin',
        isVerified: true
      }
    ];

    for (const account of demoAccounts) {
      let user = await User.findOne({ email: account.email });
      
      if (!user) {
        // Create the user if it doesn't exist
        user = await User.create(account);
        logger.info(`Demo user created: ${account.email} (${account.role})`);
      } else {
        // Update the existing user to ensure they have the correct credentials and role
        // This is safe because we're only targeting specific demo emails
        user.name = account.name;
        user.phone = account.phone;
        user.passwordHash = account.passwordHash; // Will be hashed by pre-save hook
        user.role = account.role;
        user.isVerified = account.isVerified;
        user.isActive = true;
        await user.save();
        logger.info(`Demo user updated: ${account.email} (${account.role})`);
      }

      // If it's a mechanic, also create/update a verification entry
      if (account.role === 'mechanic') {
        let verification = await MechanicVerification.findOne({ mechanicId: user._id });
        const verificationData = {
          mechanicId: user._id,
          shopName: 'Fixora Demo Workshop',
          shopAddress: {
            street: '456 Mechanic Ave',
            city: 'Tech City',
            state: 'Innovation State',
            zipCode: '560001',
            country: 'India'
          },
          location: {
            lat: 12.9716,
            lng: 77.5946
          },
          shopImage: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c.jpg',
          documentImage: 'https://images.unsplash.com/photo-1554224155-1696413565d3.jpg',
          documentType: 'shop_license',
          status: 'approved'
        };

        if (!verification) {
          await MechanicVerification.create(verificationData);
          logger.info(`Demo mechanic verification created and approved for ${account.email}`);
        } else {
          // Ensure it's approved
          verification.status = 'approved';
          await verification.save();
          logger.info(`Demo mechanic verification ensured approved for ${account.email}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error seeding demo users:', error);
  }
};

module.exports = seedDemoUsers;
