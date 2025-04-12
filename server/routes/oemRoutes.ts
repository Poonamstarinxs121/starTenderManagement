import express from 'express';
import { Request, Response } from 'express';
import OEMModel, { CreateOEMInput } from '../models/OEMModel';

const router = express.Router();

// Get all OEMs
router.get('/', async (_req: Request, res: Response) => {
  try {
    const oems = await OEMModel.findAll();
    res.json(oems);
  } catch (error) {
    console.error('Error fetching OEMs:', error);
    res.status(500).json({ message: 'Failed to fetch OEMs' });
  }
});

// Get OEM by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const oem = await OEMModel.findById(Number(req.params.id));
    if (!oem) {
      return res.status(404).json({ message: 'OEM not found' });
    }
    res.json(oem);
  } catch (error) {
    console.error('Error fetching OEM:', error);
    res.status(500).json({ message: 'Failed to fetch OEM' });
  }
});

// Create new OEM
router.post('/', async (req: Request, res: Response) => {
  try {
    const oemData: CreateOEMInput = req.body;
    const newOEM = await OEMModel.create(oemData);
    res.status(201).json(newOEM);
  } catch (error) {
    console.error('Error creating OEM:', error);
    res.status(500).json({ message: 'Failed to create OEM' });
  }
});

// Update OEM
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedOEM = await OEMModel.update(Number(req.params.id), req.body);
    if (!updatedOEM) {
      return res.status(404).json({ message: 'OEM not found' });
    }
    res.json(updatedOEM);
  } catch (error) {
    console.error('Error updating OEM:', error);
    res.status(500).json({ message: 'Failed to update OEM' });
  }
});

// Delete OEM
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await OEMModel.delete(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: 'OEM not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting OEM:', error);
    res.status(500).json({ message: 'Failed to delete OEM' });
  }
});

// Search OEMs
router.get('/search/:query', async (req, res) => {
  try {
    const oems = await OEMModel.search(req.params.query);
    res.json(oems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search OEMs' });
  }
});

// Get OEM by vendor ID
router.get('/vendor/:vendorId', async (req: Request, res: Response) => {
  try {
    const oem = await OEMModel.findByVendorId(req.params.vendorId);
    if (!oem) {
      return res.status(404).json({ message: 'OEM not found' });
    }
    res.json(oem);
  } catch (error) {
    console.error('Error fetching OEM by vendor ID:', error);
    res.status(500).json({ message: 'Failed to fetch OEM' });
  }
});

export default router; 