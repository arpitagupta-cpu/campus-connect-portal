import { 
  users, 
  announcements, 
  assignments, 
  submissions, 
  materials, 
  results,
  chatMessages,
  notifications,
  feedbacks,
  type User, 
  type InsertUser, 
  type Announcement, 
  type InsertAnnouncement, 
  type Assignment, 
  type InsertAssignment, 
  type Submission, 
  type InsertSubmission, 
  type Material, 
  type InsertMaterial, 
  type Result, 
  type InsertResult,
  type ChatMessage,
  type InsertChatMessage,
  type Notification,
  type InsertNotification,
  type Feedback,
  type InsertFeedback
} from "@shared/schema";
import { db } from './db';
import { eq, gt, lt, lte, gte, desc, and, inArray, sql, count } from 'drizzle-orm';

// Activity interface for admin dashboard
interface Activity {
  id: number;
  type: "assignment" | "announcement" | "result" | string;
  title: string;
  timestamp: string | Date;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  updateProfilePicture(id: number, profilePicture: string): Promise<User>;
  getStudents(): Promise<User[]>;
  getActiveStudentsCount(): Promise<number>;
  
  // Announcement methods
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  
  // Assignment methods
  getAllAssignments(): Promise<Assignment[]>;
  getActiveAssignments(): Promise<(Assignment & { hasSubmitted?: boolean })[]>;
  getCompletedAssignments(): Promise<(Assignment & { submission?: Submission })[]>;
  getPendingAssignmentsCount(): Promise<number>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  deleteAssignment(id: number): Promise<void>;
  getAssignmentsByMonth(year: number, month: number): Promise<(Assignment & { hasSubmitted?: boolean })[]>;
  getAssignmentsByDate(date: Date): Promise<(Assignment & { hasSubmitted?: boolean })[]>;
  
  // Submission methods
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionsByAssignment(assignmentId: number): Promise<Submission[]>;
  
  // Material methods
  getMaterials(): Promise<Material[]>;
  getRecentMaterials(): Promise<Material[]>;
  getMaterialsCount(): Promise<number>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  deleteMaterial(id: number): Promise<void>;
  
  // Result methods
  getResults(): Promise<Result[]>;
  getNewResultsCount(): Promise<number>;
  createResult(result: InsertResult): Promise<Result>;
  deleteResult(id: number): Promise<void>;
  
  // Admin dashboard methods
  getRecentActivities(): Promise<Activity[]>;
  
  // Chat messages methods
  getChatMessages(): Promise<(ChatMessage & { sender: User })[]>;
  getChatMessagesForUser(userId: number): Promise<(ChatMessage & { sender: User })[]>;
  getUnreadChatMessagesCount(userId?: number): Promise<number>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markChatMessageAsRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateProfilePicture(id: number, profilePicture: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ profilePicture })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Calendar methods
  async getAssignmentsByMonth(year: number, month: number): Promise<(Assignment & { hasSubmitted?: boolean })[]> {
    // Calculate the start and end dates for the specified month
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
    const endDate = new Date(year, month, 0); // Get the last day of the month
    
    // Get assignments with due dates in the given month
    const monthAssignments = await db
      .select()
      .from(assignments)
      .where(
        and(
          gte(assignments.dueDate, startDate),
          lte(assignments.dueDate, endDate),
          eq(assignments.isPublished, true)
        )
      )
      .orderBy(assignments.dueDate);
    
    // Get all submissions for these assignments
    const allSubmissions = await db
      .select()
      .from(submissions)
      .where(inArray(
        submissions.assignmentId, 
        monthAssignments.map(a => a.id)
      ));
    
    // Create a map of assignment id to submission status
    const submissionStatusByAssignmentId = new Map<number, boolean>();
    allSubmissions.forEach(submission => {
      submissionStatusByAssignmentId.set(submission.assignmentId, true);
    });
    
    // Merge assignments with their submission status
    return monthAssignments.map(assignment => ({
      ...assignment,
      hasSubmitted: submissionStatusByAssignmentId.has(assignment.id)
    }));
  }
  
  async getAssignmentsByDate(date: Date): Promise<(Assignment & { hasSubmitted?: boolean })[]> {
    // Create a new date at the start of the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    // Create a new date at the end of the day
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get assignments with due dates on the specified day
    const dateAssignments = await db
      .select()
      .from(assignments)
      .where(
        and(
          gte(assignments.dueDate, startDate),
          lte(assignments.dueDate, endDate),
          eq(assignments.isPublished, true)
        )
      )
      .orderBy(assignments.dueDate);
    
    // Get all submissions for these assignments
    const allSubmissions = await db
      .select()
      .from(submissions)
      .where(inArray(
        submissions.assignmentId, 
        dateAssignments.map(a => a.id)
      ));
    
    // Create a map of assignment id to submission status
    const submissionStatusByAssignmentId = new Map<number, boolean>();
    allSubmissions.forEach(submission => {
      submissionStatusByAssignmentId.set(submission.assignmentId, true);
    });
    
    // Merge assignments with their submission status
    return dateAssignments.map(assignment => ({
      ...assignment,
      hasSubmitted: submissionStatusByAssignmentId.has(assignment.id)
    }));
  }

  async getStudents(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "student"));
  }

  async getActiveStudentsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users).where(eq(users.role, "student"));
    return result[0].count;
  }
  
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values({ ...insertAnnouncement, createdAt: new Date() })
      .returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }
  
  async getAllAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments).orderBy(desc(assignments.dueDate));
  }

  async getActiveAssignments(): Promise<(Assignment & { hasSubmitted?: boolean })[]> {
    // Get active assignments
    const activeAssignments = await db
      .select()
      .from(assignments)
      .where(
        and(
          eq(assignments.isPublished, true),
          gt(assignments.dueDate, new Date())
        )
      )
      .orderBy(assignments.dueDate);
      
    // Get all submissions for these assignments
    const allSubmissions = await db
      .select()
      .from(submissions)
      .where(inArray(
        submissions.assignmentId, 
        activeAssignments.map(a => a.id)
      ));
    
    // Create a map of assignment id to submission status
    const submissionStatusByAssignmentId = new Map<number, boolean>();
    allSubmissions.forEach(submission => {
      submissionStatusByAssignmentId.set(submission.assignmentId, true);
    });
    
    // Merge assignments with their submission status
    return activeAssignments.map(assignment => ({
      ...assignment,
      hasSubmitted: submissionStatusByAssignmentId.has(assignment.id)
    }));
  }

  async getCompletedAssignments(): Promise<(Assignment & { submission?: Submission })[]> {
    const now = new Date();
    const pastAssignments = await db
      .select()
      .from(assignments)
      .where(
        and(
          eq(assignments.isPublished, true),
          lte(assignments.dueDate, now)
        )
      )
      .orderBy(desc(assignments.dueDate));
    
    // Get all submissions and map them
    const allSubmissions = await db
      .select()
      .from(submissions)
      .where(inArray(
        submissions.assignmentId, 
        pastAssignments.map(a => a.id)
      ));
    
    const submissionsByAssignmentId = new Map<number, Submission>();
    allSubmissions.forEach(submission => {
      submissionsByAssignmentId.set(submission.assignmentId, submission);
    });
    
    // Merge assignments with their submissions
    return pastAssignments.map(assignment => ({
      ...assignment,
      submission: submissionsByAssignmentId.get(assignment.id)
    }));
  }

  async getPendingAssignmentsCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(assignments)
      .where(gt(assignments.dueDate, new Date()));
    return result[0].count;
  }

  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db
      .insert(assignments)
      .values({ ...insertAssignment, createdAt: new Date() })
      .returning();
    return assignment;
  }

  async deleteAssignment(id: number): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }
  
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values({ ...insertSubmission, submittedAt: new Date() })
      .returning();
    return submission;
  }

  async getSubmissionsByAssignment(assignmentId: number): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.assignmentId, assignmentId))
      .orderBy(desc(submissions.submittedAt));
  }
  
  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials).orderBy(desc(materials.createdAt));
  }

  async getRecentMaterials(): Promise<Material[]> {
    return await db
      .select()
      .from(materials)
      .orderBy(desc(materials.createdAt))
      .limit(5);
  }

  async getMaterialsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(materials);
    return result[0].count;
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const [material] = await db
      .insert(materials)
      .values({ ...insertMaterial, createdAt: new Date() })
      .returning();
    return material;
  }

  async deleteMaterial(id: number): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }
  
  async getResults(): Promise<Result[]> {
    return await db.select().from(results).orderBy(desc(results.createdAt));
  }

  async getNewResultsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(results);
    return result[0].count;
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const [result] = await db
      .insert(results)
      .values({ ...insertResult, createdAt: new Date() })
      .returning();
    return result;
  }

  async deleteResult(id: number): Promise<void> {
    await db.delete(results).where(eq(results.id, id));
  }
  
  async getRecentActivities(): Promise<Activity[]> {
    // Get recent announcements
    const recentAnnouncements = await db
      .select({
        id: announcements.id,
        type: sql<"announcement">`'announcement'`.as("type"),
        title: announcements.title,
        timestamp: announcements.createdAt
      })
      .from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(3);
    
    // Get recent assignments
    const recentAssignments = await db
      .select({
        id: assignments.id,
        type: sql<"assignment">`'assignment'`.as("type"),
        title: assignments.title,
        timestamp: assignments.createdAt
      })
      .from(assignments)
      .orderBy(desc(assignments.createdAt))
      .limit(3);
    
    // Get recent results
    const recentResults = await db
      .select({
        id: results.id,
        type: sql<"result">`'result'`.as("type"),
        title: results.title,
        timestamp: results.createdAt
      })
      .from(results)
      .orderBy(desc(results.createdAt))
      .limit(3);
    
    // Combine and sort
    const allActivities = [
      ...recentAnnouncements, 
      ...recentAssignments, 
      ...recentResults
    ];
    
    // Sort by timestamp descending and limit to 5
    return allActivities
      .sort((a, b) => new Date(b.timestamp as Date).getTime() - new Date(a.timestamp as Date).getTime())
      .slice(0, 5);
  }
  
  // Chat messages implementation
  async getChatMessages(): Promise<(ChatMessage & { sender: User })[]> {
    const results = await db
      .select({
        id: chatMessages.id,
        senderId: chatMessages.senderId,
        content: chatMessages.content,
        timestamp: chatMessages.timestamp,
        isRead: chatMessages.isRead,
        sender: users
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .orderBy(desc(chatMessages.timestamp));
    
    // Transform results to ensure sender is never null
    const messages = results.map(msg => ({
      ...msg,
      sender: msg.sender || {
        id: 0,
        username: 'Unknown',
        password: '',
        email: '',
        role: '',
        fullName: 'Unknown User',
        phoneNumber: null,
        profilePicture: null
      }
    }));
    
    return messages;
  }
  
  async getChatMessagesForUser(userId: number): Promise<(ChatMessage & { sender: User })[]> {
    const results = await db
      .select({
        id: chatMessages.id,
        senderId: chatMessages.senderId,
        content: chatMessages.content,
        timestamp: chatMessages.timestamp,
        isRead: chatMessages.isRead,
        sender: users
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .orderBy(desc(chatMessages.timestamp));
    
    // Transform results to ensure sender is never null
    const messages = results.map(msg => ({
      ...msg,
      sender: msg.sender || {
        id: 0,
        username: 'Unknown',
        password: '',
        email: '',
        role: '',
        fullName: 'Unknown User',
        phoneNumber: null,
        profilePicture: null
      }
    }));
    
    // For students, they see all messages
    // For admins, they see all messages
    // This could be enhanced later to filter by conversation threads if needed
    return messages;
  }
  
  async getUnreadChatMessagesCount(userId?: number): Promise<number> {
    if (userId) {
      // Get unread messages for a specific user (not sent by them)
      const result = await db
        .select({ count: count() })
        .from(chatMessages)
        .where(and(
          eq(chatMessages.isRead, false),
          sql`${chatMessages.senderId} != ${userId}`
        ));
      
      return result[0].count;
    } else {
      // Get all unread messages
      const result = await db
        .select({ count: count() })
        .from(chatMessages)
        .where(eq(chatMessages.isRead, false));
      
      return result[0].count;
    }
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    
    return newMessage;
  }
  
  async markChatMessageAsRead(id: number): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.id, id));
  }
}

export const storage = new DatabaseStorage();