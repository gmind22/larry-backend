const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description || !req.file) {
    return res.status(400).json({ message: 'Name, description, and image are required' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    const event = new Event({
      name,
      description,
      image: result.secure_url,
    });

    const newEvent = await event.save();
    fs.unlinkSync(req.file.path); // Remove temp file
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;