import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { 
  insertUserSchema, 
  insertDocumentSchema,
  insertLeadSchema,
  insertTenderSchema,
  insertProjectSchema,
  insertMilestoneSchema,
  insertActivitySchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer storage
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Helper for error handling
const handleError = (error: unknown, res: Response) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.errors
    });
  }
  
  console.error("API Error:", error);
  return res.status(500).json({ message: "Internal server error" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Auth routes (simplified, no real auth for MVP)
  router.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would generate a JWT here
      // For MVP, just return user with password removed
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // User routes
  router.get("/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      return res.json(users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }));
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.post("/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Create activity
      await storage.createActivity({
        title: "User created",
        description: `User ${newUser.username} was created`,
        type: "user",
        actionType: "create",
        performedById: 1, // Assume admin
        relatedToId: newUser.id,
        relatedToType: "user"
      });
      
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.patch("/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Only validate fields that are provided
      const providedFields = Object.keys(req.body);
      if (providedFields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }
      
      const userDataSchema = insertUserSchema.partial();
      const userData = userDataSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create activity
      await storage.createActivity({
        title: "User updated",
        description: `User ${updatedUser.username} was updated`,
        type: "user",
        actionType: "update",
        performedById: 1, // Assume admin
        relatedToId: updatedUser.id,
        relatedToType: "user"
      });
      
      const { password, ...userWithoutPassword } = updatedUser;
      return res.json(userWithoutPassword);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Document routes
  router.get("/documents", async (req: Request, res: Response) => {
    try {
      const relatedToId = req.query.relatedToId ? parseInt(req.query.relatedToId as string) : undefined;
      const relatedToType = req.query.relatedToType as string | undefined;
      
      if (relatedToId && relatedToType) {
        const documents = await storage.listDocumentsByRelated(relatedToId, relatedToType);
        return res.json(documents);
      } else {
        const documents = await storage.listDocuments();
        return res.json(documents);
      }
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.get("/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      return res.json(document);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.post("/documents", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const file = req.file;
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        filePath: file.path,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedById: parseInt(req.body.uploadedById) // Convert to number
      });
      
      const newDocument = await storage.createDocument(documentData);
      
      // Create activity
      await storage.createActivity({
        title: "Document uploaded",
        description: `Document "${newDocument.title}" was uploaded`,
        type: "document",
        actionType: "create",
        performedById: newDocument.uploadedById,
        relatedToId: newDocument.id,
        relatedToType: "document"
      });
      
      return res.status(201).json(newDocument);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.patch("/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const documentDataSchema = insertDocumentSchema.partial();
      const documentData = documentDataSchema.parse(req.body);
      
      const updatedDocument = await storage.updateDocument(id, documentData);
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Create activity
      await storage.createActivity({
        title: "Document updated",
        description: `Document "${updatedDocument.title}" was updated`,
        type: "document",
        actionType: "update",
        performedById: parseInt(req.body.performedById) || updatedDocument.uploadedById,
        relatedToId: updatedDocument.id,
        relatedToType: "document"
      });
      
      return res.json(updatedDocument);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Lead routes
  router.get("/leads", async (req: Request, res: Response) => {
    try {
      const leads = await storage.listLeads();
      return res.json(leads);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.get("/leads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      return res.json(lead);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.post("/leads", async (req: Request, res: Response) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      
      const newLead = await storage.createLead(leadData);
      
      // Create activity
      await storage.createActivity({
        title: "Lead created",
        description: `Lead "${newLead.name}" from ${newLead.company} was created`,
        type: "lead",
        actionType: "create",
        performedById: parseInt(req.body.performedById) || (newLead.assignedToId || 1),
        relatedToId: newLead.id,
        relatedToType: "lead"
      });
      
      return res.status(201).json(newLead);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.patch("/leads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const leadDataSchema = insertLeadSchema.partial();
      const leadData = leadDataSchema.parse(req.body);
      
      const updatedLead = await storage.updateLead(id, leadData);
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Create activity
      await storage.createActivity({
        title: "Lead updated",
        description: `Lead "${updatedLead.name}" was updated`,
        type: "lead",
        actionType: "update",
        performedById: parseInt(req.body.performedById) || (updatedLead.assignedToId || 1),
        relatedToId: updatedLead.id,
        relatedToType: "lead"
      });
      
      return res.json(updatedLead);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Tender routes
  router.get("/tenders", async (req: Request, res: Response) => {
    try {
      const tenders = await storage.listTenders();
      return res.json(tenders);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.get("/tenders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const tender = await storage.getTender(id);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      return res.json(tender);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.post("/tenders", async (req: Request, res: Response) => {
    try {
      const tenderData = insertTenderSchema.parse(req.body);
      
      const newTender = await storage.createTender(tenderData);
      
      // Create activity
      await storage.createActivity({
        title: "Tender created",
        description: `Tender "${newTender.title}" for ${newTender.client} was created`,
        type: "tender",
        actionType: "create",
        performedById: parseInt(req.body.performedById) || (newTender.assignedToId || 1),
        relatedToId: newTender.id,
        relatedToType: "tender"
      });
      
      return res.status(201).json(newTender);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.patch("/tenders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const tenderDataSchema = insertTenderSchema.partial();
      const tenderData = tenderDataSchema.parse(req.body);
      
      const updatedTender = await storage.updateTender(id, tenderData);
      if (!updatedTender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      // Create activity
      await storage.createActivity({
        title: "Tender updated",
        description: `Tender "${updatedTender.title}" was updated`,
        type: "tender",
        actionType: "update",
        performedById: parseInt(req.body.performedById) || (updatedTender.assignedToId || 1),
        relatedToId: updatedTender.id,
        relatedToType: "tender"
      });
      
      return res.json(updatedTender);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Project routes
  router.get("/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.listProjects();
      return res.json(projects);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.get("/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      return res.json(project);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.post("/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      
      const newProject = await storage.createProject(projectData);
      
      // Create activity
      await storage.createActivity({
        title: "Project created",
        description: `Project "${newProject.name}" for ${newProject.client} was created`,
        type: "project",
        actionType: "create",
        performedById: newProject.projectManagerId,
        relatedToId: newProject.id,
        relatedToType: "project"
      });
      
      return res.status(201).json(newProject);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.patch("/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const projectDataSchema = insertProjectSchema.partial();
      const projectData = projectDataSchema.parse(req.body);
      
      const updatedProject = await storage.updateProject(id, projectData);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Create activity
      await storage.createActivity({
        title: "Project updated",
        description: `Project "${updatedProject.name}" was updated`,
        type: "project",
        actionType: "update",
        performedById: updatedProject.projectManagerId,
        relatedToId: updatedProject.id,
        relatedToType: "project"
      });
      
      return res.json(updatedProject);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Milestone routes
  router.get("/milestones", async (req: Request, res: Response) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      if (projectId) {
        const milestones = await storage.listMilestonesByProject(projectId);
        return res.json(milestones);
      } else {
        const milestones = await storage.listMilestones();
        return res.json(milestones);
      }
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.get("/milestones/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const milestone = await storage.getMilestone(id);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      return res.json(milestone);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.post("/milestones", async (req: Request, res: Response) => {
    try {
      const milestoneData = insertMilestoneSchema.parse(req.body);
      
      const newMilestone = await storage.createMilestone(milestoneData);
      
      // Create activity
      await storage.createActivity({
        title: "Milestone created",
        description: `Milestone "${newMilestone.title}" was created for project ID ${newMilestone.projectId}`,
        type: "milestone",
        actionType: "create",
        performedById: parseInt(req.body.performedById) || 1,
        relatedToId: newMilestone.id,
        relatedToType: "milestone"
      });
      
      return res.status(201).json(newMilestone);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  router.patch("/milestones/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const milestoneDataSchema = insertMilestoneSchema.partial();
      const milestoneData = milestoneDataSchema.parse(req.body);
      
      const updatedMilestone = await storage.updateMilestone(id, milestoneData);
      if (!updatedMilestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Create activity
      await storage.createActivity({
        title: "Milestone updated",
        description: `Milestone "${updatedMilestone.title}" was updated`,
        type: "milestone",
        actionType: "update",
        performedById: parseInt(req.body.performedById) || 1,
        relatedToId: updatedMilestone.id,
        relatedToType: "milestone"
      });
      
      return res.json(updatedMilestone);
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Activity routes
  router.get("/activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const relatedToId = req.query.relatedToId ? parseInt(req.query.relatedToId as string) : undefined;
      const relatedToType = req.query.relatedToType as string | undefined;
      
      if (relatedToId && relatedToType) {
        const activities = await storage.listActivitiesByRelated(relatedToId, relatedToType);
        return res.json(activities);
      } else {
        const activities = await storage.listActivities(limit);
        return res.json(activities);
      }
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Dashboard stats
  router.get("/stats/dashboard", async (req: Request, res: Response) => {
    try {
      const leads = await storage.listLeads();
      const tenders = await storage.listTenders();
      const projects = await storage.listProjects();
      
      // Calculate some basic stats
      const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;
      const openTenders = tenders.filter(t => t.status !== 'won' && t.status !== 'lost').length;
      const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length;
      
      // Win rate calculation
      const completedTenders = tenders.filter(t => t.status === 'won' || t.status === 'lost');
      const wonTenders = tenders.filter(t => t.status === 'won');
      const winRate = completedTenders.length > 0 
        ? Math.round((wonTenders.length / completedTenders.length) * 100) 
        : 0;
      
      return res.json({
        activeLeads,
        openTenders,
        activeProjects,
        winRate,
        // You would calculate these from historical data in a real app
        leadsIncrease: '+12%',
        tendersChange: 'Same as last month',
        projectsIncrease: '+3',
        winRateDecrease: '-5%'
      });
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Register the routes with prefix
  app.use("/api", router);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
