import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import StudentDashboard from "@/pages/student/dashboard";
import StudentAssignments from "@/pages/student/assignments";
import StudentResults from "@/pages/student/results";
import StudentMaterials from "@/pages/student/materials";
import StudentProfile from "@/pages/student/profile";
import StudentCalendar from "@/pages/student/calendar";
import StudentChat from "@/pages/student/chat";
import StudentNotifications from "@/pages/student/notifications";
import StudentFeedback from "@/pages/student/feedback";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAssignments from "@/pages/admin/assignments";
import AdminResults from "@/pages/admin/results";
import AdminMaterials from "@/pages/admin/materials";
import AdminAnnouncements from "@/pages/admin/announcements";
import AdminChat from "@/pages/admin/chat";
import AdminNotifications from "@/pages/admin/notifications";
import PrivateRoute from "@/components/layout/PrivateRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard">
        <PrivateRoute role="student" component={StudentDashboard} />
      </Route>
      <Route path="/student/assignments">
        <PrivateRoute role="student" component={StudentAssignments} />
      </Route>
      <Route path="/student/results">
        <PrivateRoute role="student" component={StudentResults} />
      </Route>
      <Route path="/student/materials">
        <PrivateRoute role="student" component={StudentMaterials} />
      </Route>
      <Route path="/student/profile">
        <PrivateRoute role="student" component={StudentProfile} />
      </Route>
      <Route path="/student/calendar">
        <PrivateRoute role="student" component={StudentCalendar} />
      </Route>
      <Route path="/student/chat">
        <PrivateRoute role="student" component={StudentChat} />
      </Route>
      <Route path="/student/notifications">
        <PrivateRoute role="student" component={StudentNotifications} />
      </Route>
      <Route path="/student/feedback">
        <PrivateRoute role="student" component={StudentFeedback} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <PrivateRoute role="admin" component={AdminDashboard} />
      </Route>
      <Route path="/admin/assignments">
        <PrivateRoute role="admin" component={AdminAssignments} />
      </Route>
      <Route path="/admin/results">
        <PrivateRoute role="admin" component={AdminResults} />
      </Route>
      <Route path="/admin/materials">
        <PrivateRoute role="admin" component={AdminMaterials} />
      </Route>
      <Route path="/admin/announcements">
        <PrivateRoute role="admin" component={AdminAnnouncements} />
      </Route>
      <Route path="/admin/chat">
        <PrivateRoute role="admin" component={AdminChat} />
      </Route>
      <Route path="/admin/notifications">
        <PrivateRoute role="admin" component={AdminNotifications} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
