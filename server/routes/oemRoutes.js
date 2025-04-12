import express from 'express';
import oemModel from '../models/OEMModel.js';

const router = express.Router();

// Create new OEM
router.post('/', async (req, res) => {
  try {
    const id = await oemModel.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all OEMs
router.get('/', async (req, res) => {
  try {
    const oems = await oemModel.findAll();
    res.json(oems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get OEM by ID
router.get('/:id', async (req, res) => {
  try {
    const oem = await oemModel.findById(req.params.id);
    if (!oem) {
      return res.status(404).json({ error: 'OEM not found' });
    }
    res.json(oem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get OEM by vendor ID
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const oem = await oemModel.findByVendorId(req.params.vendorId);
    if (!oem) {
      return res.status(404).json({ error: 'OEM not found' });
    }
    res.json(oem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update OEM
router.put('/:id', async (req, res) => {
  try {
    const success = await oemModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'OEM not found' });
    }
    res.json({ message: 'OEM updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete OEM
router.delete('/:id', async (req, res) => {
  try {
    const success = await oemModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'OEM not found' });
    }
    res.json({ message: 'OEM deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search OEMs
router.get('/search/:query', async (req, res) => {
  try {
    const oems = await oemModel.search(req.params.query);
    res.json(oems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 