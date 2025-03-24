import {
  users, User, InsertUser,
  documents, Document, InsertDocument,
  leads, Lead, InsertLead,
  tenders, Tender, InsertTender,
  projects, Project, InsertProject,
  milestones, Milestone, InsertMilestone,
  activities, Activity, InsertActivity
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  listDocuments(): Promise<Document[]>;
  listDocumentsByRelated(relatedToId: number, relatedToType: string): Promise<Document[]>;
  
  // Lead operations
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  listLeads(): Promise<Lead[]>;
  
  // Tender operations
  getTender(id: number): Promise<Tender | undefined>;
  createTender(tender: InsertTender): Promise<Tender>;
  updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender | undefined>;
  listTenders(): Promise<Tender[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  listProjects(): Promise<Project[]>;
  
  // Milestone operations
  getMilestone(id: number): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  listMilestones(): Promise<Milestone[]>;
  listMilestonesByProject(projectId: number): Promise<Milestone[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  listActivities(limit?: number): Promise<Activity[]>;
  listActivitiesByRelated(relatedToId: number, relatedToType: string): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private leads: Map<number, Lead>;
  private tenders: Map<number, Tender>;
  private projects: Map<number, Project>;
  private milestones: Map<number, Milestone>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private documentIdCounter: number;
  private leadIdCounter: number;
  private tenderIdCounter: number;
  private projectIdCounter: number;
  private milestoneIdCounter: number;
  private activityIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.leads = new Map();
    this.tenders = new Map();
    this.projects = new Map();
    this.milestones = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
    this.leadIdCounter = 1;
    this.tenderIdCounter = 1;
    this.projectIdCounter = 1;
    this.milestoneIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      fullName: "System Administrator",
      email: "admin@example.com",
      role: "admin",
      active: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: now,
      updatedAt: now
    };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = await this.getDocument(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument: Document = {
      ...existingDocument,
      ...documentData,
      updatedAt: new Date()
    };
    
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async listDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async listDocumentsByRelated(relatedToId: number, relatedToType: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.relatedToId === relatedToId && doc.relatedToType === relatedToType
    );
  }
  
  // Lead operations
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }
  
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.leadIdCounter++;
    const now = new Date();
    const lead: Lead = {
      ...insertLead,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.leads.set(id, lead);
    return lead;
  }
  
  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const existingLead = await this.getLead(id);
    if (!existingLead) return undefined;
    
    const updatedLead: Lead = {
      ...existingLead,
      ...leadData,
      updatedAt: new Date()
    };
    
    this.leads.set(id, updatedLead);
    return updatedLead;
  }
  
  async listLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }
  
  // Tender operations
  async getTender(id: number): Promise<Tender | undefined> {
    return this.tenders.get(id);
  }
  
  async createTender(insertTender: InsertTender): Promise<Tender> {
    const id = this.tenderIdCounter++;
    const now = new Date();
    const tender: Tender = {
      ...insertTender,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tenders.set(id, tender);
    return tender;
  }
  
  async updateTender(id: number, tenderData: Partial<InsertTender>): Promise<Tender | undefined> {
    const existingTender = await this.getTender(id);
    if (!existingTender) return undefined;
    
    const updatedTender: Tender = {
      ...existingTender,
      ...tenderData,
      updatedAt: new Date()
    };
    
    this.tenders.set(id, updatedTender);
    return updatedTender;
  }
  
  async listTenders(): Promise<Tender[]> {
    return Array.from(this.tenders.values());
  }
  
  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = await this.getProject(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = {
      ...existingProject,
      ...projectData,
      updatedAt: new Date()
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  // Milestone operations
  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }
  
  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = this.milestoneIdCounter++;
    const now = new Date();
    const milestone: Milestone = {
      ...insertMilestone,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.milestones.set(id, milestone);
    return milestone;
  }
  
  async updateMilestone(id: number, milestoneData: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const existingMilestone = await this.getMilestone(id);
    if (!existingMilestone) return undefined;
    
    const updatedMilestone: Milestone = {
      ...existingMilestone,
      ...milestoneData,
      updatedAt: new Date()
    };
    
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }
  
  async listMilestones(): Promise<Milestone[]> {
    return Array.from(this.milestones.values());
  }
  
  async listMilestonesByProject(projectId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(
      milestone => milestone.projectId === projectId
    );
  }
  
  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  async listActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      return activities.slice(0, limit);
    }
    
    return activities;
  }
  
  async listActivitiesByRelated(relatedToId: number, relatedToType: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => 
        activity.relatedToId === relatedToId && 
        activity.relatedToType === relatedToType
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
