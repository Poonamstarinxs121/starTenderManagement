import express from 'express';
import leadModel from '../models/LeadModel.js';

const router = express.Router();

// Create new lead
router.post('/', async (req, res) => {
  try {
    const id = await leadModel.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all leads
router.get('/', async (req, res) => {
  try {
    const leads = await leadModel.findAll();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await leadModel.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leads by assigned user
router.get('/user/:userId', async (req, res) => {
  try {
    const leads = await leadModel.findByAssignedUser(req.params.userId);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const success = await leadModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lead status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const success = await leadModel.updateStatus(req.params.id, status);
    if (!success) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const success = await leadModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search leads
router.get('/search/:query', async (req, res) => {
  try {
    const leads = await leadModel.search(req.params.query);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming follow-ups
router.get('/follow-ups/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const leads = await leadModel.getUpcomingFollowUps(days);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 