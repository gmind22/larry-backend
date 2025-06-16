const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper: Count files by month
function countFilesByMonth(directory) {
  const monthlyCount = {};
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const stats = fs.statSync(path.join(directory, file));
    const month = new Date(stats.birthtime).toLocaleString('default', { month: 'short', year: 'numeric' });

    if (!monthlyCount[month]) {
      monthlyCount[month] = 0;
    }
    monthlyCount[month]++;
  });

  return monthlyCount;
}

// GET /api/analytics/uploads/monthly
router.get('/uploads/monthly', (req, res) => {
  const portfolioDir = path.join(__dirname, '../uploads/portfolio');
  const heroDir = path.join(__dirname, '../uploads/hero-photos');

  const portfolioStats = countFilesByMonth(portfolioDir);
  const heroStats = countFilesByMonth(heroDir);

  res.json({ portfolio: portfolioStats, heroPhotos: heroStats });
});

// GET /api/analytics/uploads/summary
router.get('/uploads/summary', (req, res) => {
  const portfolioDir = path.join(__dirname, '../uploads/portfolio');
  const heroDir = path.join(__dirname, '../uploads/hero-photos');

  const portfolioCount = fs.readdirSync(portfolioDir).length;
  const heroCount = fs.readdirSync(heroDir).length;

  res.json({
    portfolioUploads: portfolioCount,
    heroPhotoUploads: heroCount
  });
});

module.exports = router;
