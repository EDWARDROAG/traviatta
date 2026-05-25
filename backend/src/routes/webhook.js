/**
 * ======================================================
 * ARCHIVO: webhook.js
 * UBICACIÓN: menu-qr-system/backend/src/routes/webhook.js
 * FASE: F5
 * VERSIÓN: 1.1
 * ÚLTIMA ACTUALIZACIÓN: 2024-05-21 15:15
 * ======================================================
 */

const express = require('express');
const router = express.Router();

// ======================================================
// WEBHOOK DE WHATSAPP BUSINESS API
// ======================================================

router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'default_verify_token';
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('WhatsApp webhook verification failed');
    res.sendStatus(403);
  }
});

router.post('/whatsapp', async (req, res) => {
  try {
    console.log('WhatsApp webhook received');
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error.message);
    res.sendStatus(500);
  }
});

// ======================================================
// WEBHOOK DE PAGOS
// ======================================================

router.post('/payment', async (req, res) => {
  try {
    console.log('Payment webhook received');
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing payment webhook:', error.message);
    res.sendStatus(500);
  }
});

// ======================================================
// WEBHOOK DE ESTADO DE PEDIDOS
// ======================================================

router.post('/order-status', async (req, res) => {
  try {
    console.log('Order status webhook received');
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing order status webhook:', error.message);
    res.sendStatus(500);
  }
});

// ======================================================
// HEALTH CHECK
// ======================================================

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    endpoints: ['whatsapp', 'payment', 'order-status'],
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = router;