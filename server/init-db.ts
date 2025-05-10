import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Initializes the database with default users if they don't exist
 */
export async function initDatabase() {
  console.log("Checking for default users...");
  
  // Check if admin user exists
  const adminExists = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
  
  if (adminExists.length === 0) {
    console.log("Creating default admin user...");
    await db.insert(users).values({
      username: "admin",
      password: "admin123",
      email: "admin@campusconnect.edu",
      role: "admin",
      fullName: "Admin User",
    });
  }
  
  // Check if student user exists
  const studentExists = await db.select().from(users).where(eq(users.username, "student")).limit(1);
  
  if (studentExists.length === 0) {
    console.log("Creating default student user...");
    await db.insert(users).values({
      username: "student",
      password: "student123",
      email: "student@campusconnect.edu",
      role: "student",
      fullName: "John Student",
    });
  }
  
  console.log("Database initialization complete.");
}