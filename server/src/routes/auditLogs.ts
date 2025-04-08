import { Router } from 'express';
import { db } from '../db';
import { auditLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

// Create audit log
router.post('/', async (req, res) => {
  try {
    const { userId, action, resourceId, description } = req.body;
    
    const newLog = {
      logId: nanoid(),
      userId,
      action,
      resourceId,
      description,
    };
    
    await db.insert(auditLogs).values(newLog);
    
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Get audit logs
router.get('/', async (req, res) => {
  try {
    const logs = await db.select().from(auditLogs).orderBy(auditLogs.timestamp);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(auditLogs.timestamp);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch user audit logs' });
  }
});

export default router; 