// server/routes/portfolio.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const outputPath = `uploads/resized-${Date.now()}.jpg`;

    await sharp(req.file.path)
      .resize(1024) // resize to width 1024px
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(req.file.path); // delete original uploaded file

    res.json({ message: 'Image uploaded and resized successfully', file: outputPath });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
