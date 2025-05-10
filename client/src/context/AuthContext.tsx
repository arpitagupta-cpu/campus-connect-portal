import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (userType?: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  checkUserRole: (uid: string) => Promise<string>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkUserRole = async (uid: string): Promise<string> => {
    try {
      const response = await apiRequest("GET", `/api/users/role/${uid}`, undefined);
      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error("Error checking user role:", error);
      return "student"; // Default role
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const role = await checkUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      setLoading(true);
      
      try {
        // First try to login with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const role = await checkUserRole(userCredential.user.uid);
        setUserRole(role);
        toast({
          title: "Login successful",
          description: `Welcome back!`,
        });
        return;
      } catch (firebaseError: any) {
        console.log("Firebase login failed, trying API login", firebaseError);
        
        if (firebaseError.code === "auth/configuration-not-found") {
          // If Firebase is not configured, use our backend login API
          try {
            // Extract username from email (everything before @)
            const username = email.split('@')[0];
            
            // Call our backend login API
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password }),
            });
            
            if (!response.ok) {
              throw new Error('Invalid credentials');
            }
            
            const userData = await response.json();
            
            // Manually set the current user since we're not using Firebase auth
            // This is a simplified user object that has the necessary fields
            const user = {
              uid: userData.id.toString(),
              email: userData.email,
              displayName: userData.fullName,
            } as unknown as User;
            
            setCurrentUser(user);
            setUserRole(userData.role);
            
            toast({
              title: "Login successful",
              description: `Welcome back, ${userData.fullName}!`,
            });
            return;
          } catch (apiError) {
            console.error("API login error:", apiError);
            throw new Error('Invalid credentials');
          }
        } else {
          // For other Firebase errors, throw the original error
          throw firebaseError;
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.code || "auth/unknown-error");
      
      let errorMessage = "Invalid credentials";
      
      if (error.code === "auth/configuration-not-found") {
        errorMessage = "Authentication is not properly configured. Using local authentication instead.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection";
      }
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (userType = "student") => {
    setAuthError(null);
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      // Store the user type preference to use after authentication
      localStorage.setItem("preferredUserType", userType);
      
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      // Get user role or set default based on the chosen type
      let role = await checkUserRole(result.user.uid);
      if (!role) {
        // If user doesn't have a role yet, set it based on their preference
        role = userType;
        // Here you would typically make an API call to save the user's role
        // For now we're just setting it in state
      }
      
      setUserRole(role);
      
      toast({
        title: "Login successful",
        description: `Welcome, ${result.user.displayName || "User"}!`,
      });
    } catch (error: any) {
      console.error("Google login error:", error);
      setAuthError(error.code || "auth/unknown-error");
      
      let errorMessage = "Google sign-in failed";
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Sign-in popup was blocked. Please allow popups for this site.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Multiple popup requests were made. Please try again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage = "Firebase authentication is not properly configured. Please make sure Google Authentication is enabled in Firebase console.";
      }
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // If we have a Firebase user, sign out from Firebase
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      
      // Always clear our local state regardless of authentication method
      setCurrentUser(null);
      setUserRole(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send password reset email",
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    loginWithGoogle,
    signOut,
    forgotPassword,
    checkUserRole,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
