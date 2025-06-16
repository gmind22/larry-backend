const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  public_id: String, // Cloudinary ID in case you want to delete later
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
