const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Portfolio = require('../models/Portfolio');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const items = await Portfolio.find({});
    let updatedCount = 0;

    for (const item of items) {
      if (!item.url.includes('f_auto')) {
        const updatedUrl = item.url.replace('/upload/', '/upload/f_auto,q_auto/');
        item.url = updatedUrl;
        await item.save();
        updatedCount++;
        console.log(`✅ Updated: ${item.title}`);
      }
    }

    console.log(`\n✅ Migration complete. ${updatedCount} URLs updated.`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error connecting to MongoDB:', err);
  });
