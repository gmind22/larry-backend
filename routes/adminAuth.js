const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const ResetToken = require('../models/ResetToken');

const router = express.Router();

// Send token to email
router.post('/request-reset-token', async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await ResetToken.create({ email, token, expiresAt });

    const resetLink = `https://yourfrontend.com/admin/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Password Reset',
      text: `Click the link to reset your password (valid for 15 minutes): ${resetLink}`
    });

    res.json({ message: 'Reset link sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send reset token' });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const resetEntry = await ResetToken.findOne({ token });

    if (!resetEntry || resetEntry.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Token is invalid or expired' });
    }

    const admin = await Admin.findOne({ email: resetEntry.email });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    await ResetToken.deleteOne({ token });

    res.json({ message: 'Password has been successfully reset.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
