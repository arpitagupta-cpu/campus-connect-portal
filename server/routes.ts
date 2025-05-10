import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertAnnouncementSchema, 
  insertAssignmentSchema, 
  insertSubmissionSchema, 
  insertMaterialSchema, 
  insertResultSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation
  const validateRequest = (schema: any, body: any) => {
    try {
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        throw { status: 400, message: "Validation error", errors: formattedErrors };
      }
      throw error;
    }
  };

  // Auth Routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        fullName: user.fullName
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = validateRequest(insertUserSchema, req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(userData);
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      });
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message, errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/users/role/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ role: user.role });
    } catch (error) {
      console.error("Error getting user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User Profile Routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch('/api/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Ensure we don't allow role changes through this endpoint
      delete userData.role;
      // Don't allow password changes through this endpoint
      delete userData.password;
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch('/api/users/:id/profile-picture', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { profilePicture } = req.body;
      
      if (!profilePicture) {
        return res.status(400).json({ message: "Profile picture is required" });
      }
      
      const updatedUser = await storage.updateProfilePicture(userId, profilePicture);
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Announcements Routes
  app.get('/api/announcements', async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/announcements', async (req, res) => {
    try {
      const announcementData = validateRequest(insertAnnouncementSchema, req.body);
      const announcement = await storage.createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message, errors: error.errors });
      }
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/announcements/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Announcements Routes
  app.get('/api/admin/announcements', async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching admin announcements:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Assignments Routes
  app.get('/api/assignments/active', async (req, res) => {
    try {
      const assignments = await storage.getActiveAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching active assignments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/assignments/completed', async (req, res) => {
    try {
      const assignments = await storage.getCompletedAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching completed assignments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/assignments/pending/count', async (req, res) => {
    try {
      const count = await storage.getPendingAssignmentsCount();
      res.json({ pendingCount: count });
    } catch (error) {
      console.error("Error fetching pending assignments count:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/assignments', async (req, res) => {
    try {
      const assignmentData = validateRequest(insertAssignmentSchema, req.body);
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message, errors: error.errors });
      }
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/assignments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssignment(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Assignments Routes
  app.get('/api/admin/assignments', async (req, res) => {
    try {
      const assignments = await storage.getAllAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching admin assignments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submissions Routes
  app.post('/api/submissions', async (req, res) => {
    try {
      const submissionData = validateRequest(insertSubmissionSchema, req.body);
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message, errors: error.errors });
      }
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/assignments/:id/submissions', async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const submissions = await storage.getSubmissionsByAssignment(assignmentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Calendar Events Routes
  app.get('/api/calendar/events', async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      
      // Get assignments with due dates in the given month
      const assignments = await storage.getAssignmentsByMonth(year, month);
      
      // Format the events in a calendar-friendly format
      const events = assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        date: assignment.dueDate,
        type: 'assignment',
        hasSubmitted: assignment.hasSubmitted,
      }));
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get('/api/calendar/events/:date', async (req, res) => {
    try {
      const dateStr = req.params.date;
      const date = new Date(dateStr);
      
      // Get assignments due on the specific date
      const assignments = await storage.getAssignmentsByDate(date);
      
      // Format the events in a detailed format
      const events = assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        date: assignment.dueDate,
        type: 'assignment',
        hasSubmitted: assignment.hasSubmitted,
      }));
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events for date:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Materials Routes
  app.get('/api/materials', async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/materials/recent', async (req, res) => {
    try {
      const materials = await storage.getRecentMaterials();
      res.json(materials);
    } catch (error) {
      console.error("Error fetching recent materials:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/materials', async (req, res) => {
    try {
      const materialData = validateRequest(insertMaterialSchema, req.body);
      const material = await storage.createMaterial(materialData);
      res.status(201).json(material);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message, errors: error.errors });
      }
      console.error("Error creating material:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/materials/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMaterial(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Materials Routes
  app.get('/api/admin/materials', async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      console.error("Error fetching admin materials:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Results Routes
  app.get('/api/results', async (req, res) => {
    try {
      const results = await storage.getResults();
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/results/new/count', async (req, res) => {
    try {
      const count = await storage.getNewResultsCount();
      res.json({ newCount: count });
    } catch (error) {
      console.error("Error fetching new results count:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/results', async (req, res) => {
    try {
      const resultData = validateRequest(insertResultSchema, req.body);
      const result = await storage.createResult(resultData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message, errors: error.errors });
      }
      console.error("Error creating result:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/results/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteResult(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting result:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Calendar Routes
  app.get('/api/calendar/events', async (req, res) => {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
      }
      
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      
      if (isNaN(yearNum) || isNaN(monthNum)) {
        return res.status(400).json({ error: 'Invalid year or month format' });
      }
      
      const events = await storage.getAssignmentsByMonth(yearNum, monthNum);
      res.json(events);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  });
  
  app.get('/api/calendar/events/:date', async (req, res) => {
    try {
      const dateString = req.params.date;
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      
      const events = await storage.getAssignmentsByDate(date);
      
      // Add description field to match the DetailedEvent interface in the frontend
      const detailedEvents = events.map(event => ({
        ...event,
        description: event.description || 'No description available'
      }));
      
      res.json(detailedEvents);
    } catch (error) {
      console.error('Error fetching events by date:', error);
      res.status(500).json({ error: 'Failed to fetch events for the selected date' });
    }
  });
  
  // Chat Routes
  app.get('/api/chat/messages', async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });
  
  app.get('/api/chat/messages/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const messages = await storage.getChatMessagesForUser(userId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching user chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch user chat messages' });
    }
  });
  
  app.get('/api/chat/messages/unread', async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (req.query.userId && isNaN(userId!)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const count = await storage.getUnreadChatMessagesCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      res.status(500).json({ error: 'Failed to fetch unread message count' });
    }
  });
  
  app.post('/api/chat/messages', async (req, res) => {
    try {
      const messageData = validateRequest(insertChatMessageSchema, req.body);
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message, errors: error.errors });
      }
      console.error('Error creating chat message:', error);
      res.status(500).json({ error: 'Failed to create chat message' });
    }
  });
  
  app.put('/api/chat/messages/:id/read', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }
      
      await storage.markChatMessageAsRead(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  // Admin Results Routes
  app.get('/api/admin/results', async (req, res) => {
    try {
      const results = await storage.getResults();
      res.json(results);
    } catch (error) {
      console.error("Error fetching admin results:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Stats Route
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const activeStudents = await storage.getActiveStudentsCount();
      const pendingAssignments = await storage.getPendingAssignmentsCount();
      const studyMaterials = await storage.getMaterialsCount();
      
      res.json({
        activeStudents,
        pendingAssignments,
        studyMaterials
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Activities Route
  app.get('/api/admin/activities', async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Students Route (for dropdown in result upload)
  app.get('/api/admin/students', async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
