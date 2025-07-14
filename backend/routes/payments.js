const express = require('express');
const router = express.Router();
const mpesaService = require('../services/mpesaService');
const Ad = require('../models/Ad');
const { authMiddleware } = require('../middleware/auth');
const mongoose = require('mongoose');

// POST /api/payments/mpesa/initiate
router.post('/mpesa/initiate', authMiddleware, async (req, res) => {
  try {
    const { adId, phone } = req.body;
    if (!mongoose.Types.ObjectId.isValid(adId)) return res.status(400).json({ error: 'Invalid adId' });
    const ad = await Ad.findById(adId);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    if (ad.boosted && ad.boostEndDate > new Date()) return res.status(400).json({ error: 'Ad is already boosted' });

    const amount = 100; // Ksh 100
    const reference = `AD${ad._id}-${Date.now()}`;
    const description = `Promotion for Ad: ${ad.title}`;

    const mpesaRes = await mpesaService.initiateSTKPush({ phone, amount, reference, description });
    // Save payment reference temporarily
    ad.paymentReference = reference;
    await ad.save();
    res.json({ success: true, mpesaRes, reference });
  } catch (error) {
    console.error('M-Pesa initiate error:', error);
    res.status(500).json({ error: 'Failed to initiate M-Pesa payment' });
  }
});

// POST /api/payments/mpesa-callback
router.post('/mpesa-callback', async (req, res) => {
  try {
    const callbackData = req.body;
    const result = await mpesaService.handleCallback(callbackData);
    if (result.success) {
      // Find ad by paymentReference
      const ad = await Ad.findOne({ paymentReference: result.reference });
      if (ad) {
        ad.boosted = true;
        ad.boostStartDate = new Date();
        ad.boostEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        ad.promotionHistory.push({
          boostStartDate: ad.boostStartDate,
          boostEndDate: ad.boostEndDate,
          paymentReference: result.reference,
          amount: result.amount
        });
        await ad.save();
        // TODO: Send SMS/Email receipt
      }
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ error: 'Failed to process M-Pesa callback' });
  }
});

module.exports = router; 