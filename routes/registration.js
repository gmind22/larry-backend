const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const nodemailer = require('nodemailer');

// Create a new registration and send email
router.post('/', async (req, res) => {
  const { name, email, event, details } = req.body;

  try {
    const newRegistration = new Registration({ name, email, event, details });
    await newRegistration.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'gmind22@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // Store this in your .env file
      },
    });

    await transporter.sendMail({
      from: `"Event Inquiry" <gmind22@gmail.com>`,
      to: 'gmind22@gmail.com',
      subject: `New Event Inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nEvent: ${event}\nDetails:\n${details}`,
    });

    res.status(200).json({ message: 'Registration saved and email sent' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Failed to save registration' });
  }
});

// Get all registrations
router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

module.exports = router;
