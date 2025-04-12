import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { db } from '../db';
import { documents } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation schemas
const uploadDocumentSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1),
  type: z.string().min(1)
});

// Get all documents for a company
router.get('/:companyId', authenticateToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const docs = await db.select().from(documents).where(eq(documents.companyId, companyId));
    res.json(docs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload a new document
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const validatedData = uploadDocumentSchema.parse(req.body);
    
    const newDocument = await db.insert(documents).values({
      companyId: validatedData.companyId,
      name: validatedData.name,
      type: validatedData.type,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    }).returning();

    res.status(201).json(newDocument[0]);
  } catch (error) {
    console.error('Error uploading document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Download a document
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    
    if (!doc.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = doc[0].filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, doc[0].fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Delete a document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    
    if (!doc.length) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from storage
    if (fs.existsSync(doc[0].filePath)) {
      fs.unlinkSync(doc[0].filePath);
    }

    // Delete record from database
    await db.delete(documents).where(eq(documents.id, id));
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router; 