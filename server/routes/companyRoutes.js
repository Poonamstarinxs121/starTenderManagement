import express from 'express';
import companyModel from '../models/CompanyModel.js';

const router = express.Router();

// Create new company
router.post('/', async (req, res) => {
  try {
    const id = await companyModel.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await companyModel.findAll();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await companyModel.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const success = await companyModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const success = await companyModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search companies
router.get('/search/:query', async (req, res) => {
  try {
    const companies = await companyModel.search(req.params.query);
    res.json(companies);
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 