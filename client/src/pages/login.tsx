import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("student");
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [showLocalAuthInfo, setShowLocalAuthInfo] = useState(true);
  const { login, loginWithGoogle, authError } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter both email and password",
      });
      return;
    }

    try {
      setIsPending(true);
      await login(email, password);
      
      // Redirect based on user role (this will be handled by the auth context)
      if (activeTab === "student") {
        setLocation("/student/dashboard");
      } else {
        setLocation("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Toast is already shown in the auth context
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGooglePending(true);
      await loginWithGoogle(activeTab);
      
      // Redirect based on user role
      if (activeTab === "student") {
        setLocation("/student/dashboard");
      } else {
        setLocation("/admin/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      // Toast is already shown in the auth context
    } finally {
      setIsGooglePending(false);
    }
  };

  // Display authentication information for local login
  const renderAuthInfo = () => {
    return (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
        <p className="font-medium">Authentication Information</p>
        <p className="mt-1">
          The system is using local database authentication. You can log in with:
        </p>
        <div className="mt-2 space-y-2">
          <div className="p-2 bg-amber-100 rounded">
            <p><strong>Student Login:</strong></p>
            <p>Email: student@campusconnect.edu (or just use "student")</p>
            <p>Password: student123</p>
          </div>
          <div className="p-2 bg-amber-100 rounded">
            <p><strong>Admin Login:</strong></p>
            <p>Email: admin@campusconnect.edu (or just use "admin")</p>
            <p>Password: admin123</p>
          </div>
        </div>
        <p className="mt-2 text-xs">
          Firebase authentication is not configured on this instance. The system will automatically use the local database for authentication.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <Card className="w-full max-w-md overflow-hidden">
        <div className={`${activeTab === 'student' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-indigo-600 to-indigo-700'} text-white p-6 text-center`}>
          <h1 className="text-2xl font-medium mb-1">CampusConnect</h1>
          <p className="text-sm opacity-80">Your Campus Companion</p>
        </div>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-4">
            <Button 
              type="button" 
              variant="outline"
              className="w-full flex items-center justify-center gap-2" 
              disabled={isGooglePending}
              onClick={handleGoogleLogin}
            >
              {isGooglePending ? <LoadingSpinner /> : (
                <>
                  <FcGoogle size={20} />
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="mt-4">
            <div className="mb-4">
              <Label htmlFor="email" className="mb-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            
            <div className="mb-6">
              <Label htmlFor="password" className="mb-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
              <div className="mt-1 text-sm text-right">
                <a href="#" className="text-primary hover:text-primary-dark">
                  Forgot password?
                </a>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending}
            >
              {isPending ? <LoadingSpinner /> : "Login with Email"}
            </Button>
          </form>
          
          {showLocalAuthInfo && renderAuthInfo()}
        </CardContent>
      </Card>
    </div>
  );
}
