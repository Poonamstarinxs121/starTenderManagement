import { Router } from 'express';
import { db } from '../../db';
import { oems, oemDocuments } from '@shared/schema';
import { uploadFile, upload } from '../storage';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const router = Router();

// Validation schema
const oemSchema = z.object({
  companyName: z.string().min(1),
  registeredAddress: z.string().min(1),
  registrationNumber: z.string().min(1),
  panNumber: z.string().min(1),
  gstNumber: z.string().min(1),
  contactPersonName: z.string().min(1),
  designation: z.string().min(1),
  phoneNumber: z.string().min(1),
  emailAddress: z.string().email(),
  oemStatus: z.enum(['verified', 'pending', 'rejected']),
});

// Get all OEMs
router.get('/', async (req, res) => {
  try {
    const allOEMs = await db.select().from(oems);
    res.json(allOEMs);
  } catch (error) {
    console.error('Error fetching OEMs:', error);
    res.status(500).json({ error: 'Failed to fetch OEMs' });
  }
});

// Get single OEM
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const oem = await db.select().from(oems).where(eq(oems.id, parseInt(id))).limit(1);
    
    if (!oem.length) {
      return res.status(404).json({ error: 'OEM not found' });
    }

    // Get OEM documents
    const documents = await db.select().from(oemDocuments).where(eq(oemDocuments.oemId, parseInt(id)));

    res.json({ ...oem[0], documents });
  } catch (error) {
    console.error('Error fetching OEM:', error);
    res.status(500).json({ error: 'Failed to fetch OEM' });
  }
});

// Create OEM
router.post('/', async (req, res) => {
  try {
    const validatedData = oemSchema.parse(req.body);
    const [newOEM] = await db.insert(oems).values(validatedData).returning();
    res.status(201).json(newOEM);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error creating OEM:', error);
      res.status(500).json({ error: 'Failed to create OEM' });
    }
  }
});

// Update OEM
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = oemSchema.parse(req.body);
    const [updatedOEM] = await db
      .update(oems)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(oems.id, parseInt(id)))
      .returning();

    if (!updatedOEM) {
      return res.status(404).json({ error: 'OEM not found' });
    }

    res.json(updatedOEM);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error updating OEM:', error);
      res.status(500).json({ error: 'Failed to update OEM' });
    }
  }
});

// Delete OEM
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedOEM] = await db
      .delete(oems)
      .where(eq(oems.id, parseInt(id)))
      .returning();

    if (!deletedOEM) {
      return res.status(404).json({ error: 'OEM not found' });
    }

    res.json({ message: 'OEM deleted successfully' });
  } catch (error) {
    console.error('Error deleting OEM:', error);
    res.status(500).json({ error: 'Failed to delete OEM' });
  }
});

// Upload OEM document
router.post('/:id/documents', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = await uploadFile(file, 'oem-documents');
    const [newDocument] = await db
      .insert(oemDocuments)
      .values({
        oemId: parseInt(id),
        documentType,
        documentName: file.originalname,
        fileUrl,
      })
      .returning();

    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Delete OEM document
router.delete('/:id/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const [deletedDocument] = await db
      .delete(oemDocuments)
      .where(eq(oemDocuments.id, parseInt(documentId)))
      .returning();

    if (!deletedDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router; 