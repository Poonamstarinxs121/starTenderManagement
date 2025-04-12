import express from 'express';
import customerModel from '../models/CustomerModel.js';

const router = express.Router();

// Create new customer
router.post('/', async (req, res) => {
  try {
    const id = await customerModel.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await customerModel.findAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await customerModel.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const success = await customerModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const success = await customerModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search customers
router.get('/search/:query', async (req, res) => {
  try {
    const customers = await customerModel.search(req.params.query);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 