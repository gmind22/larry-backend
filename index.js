const express = require('express');
const multer = require('multer');
const streamifier = require('streamifier');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Init Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Setup
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes
const adminAuthRoutes = require('./routes/adminAuth');
app.use('/api/admin', adminAuthRoutes);

// Models
const Portfolio = require('./models/Portfolio');

// === Portfolio Upload ===
app.post('/api/portfolio/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file || !title || !description) {
      return res.status(400).json({ error: 'Missing image or form fields' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio',
        resource_type: 'image',
        type: 'upload'
      },
      async (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Upload to Cloudinary failed' });
        }

        const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');

        const portfolio = new Portfolio({
          title,
          description,
          url: optimizedUrl,
          public_id: result.public_id,
        });

        await portfolio.save();
        res.status(200).json({ message: 'Upload successful', portfolio });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (err) {
    console.error('❌ General server error during upload:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// === Portfolio List ===
app.get('/api/portfolio/list', async (req, res) => {
  try {
    const items = await Portfolio.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// === Portfolio Delete ===
app.delete('/api/portfolio/delete/:id', async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await cloudinary.uploader.destroy(item.public_id);
    await item.deleteOne();

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

const registrationRoutes = require('./routes/registration');
app.use('/api/registrations', registrationRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
