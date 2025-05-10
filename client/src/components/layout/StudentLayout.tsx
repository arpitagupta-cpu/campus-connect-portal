import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  FileText, 
  Award, 
  BookOpen, 
  UserCircle,
  LogOut,
  CalendarDays,
  MessageCircle,
  Bell,
  ThumbsUp,
  Search
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface StudentLayoutProps {
  children: ReactNode;
  title: string;
}

export default function StudentLayout({ children, title }: StudentLayoutProps) {
  const { currentUser, signOut } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/student/dashboard" },
    { name: "Assignments", icon: <FileText size={20} />, path: "/student/assignments" },
    { name: "Results", icon: <Award size={20} />, path: "/student/results" },
    { name: "Materials", icon: <BookOpen size={20} />, path: "/student/materials" },
    { name: "Calendar", icon: <CalendarDays size={20} />, path: "/student/calendar" },
    { name: "Chat", icon: <MessageCircle size={20} />, path: "/student/chat" },
    { name: "Notifications", icon: <Bell size={20} />, path: "/student/notifications" },
    { name: "Feedback", icon: <ThumbsUp size={20} />, path: "/student/feedback" },
    { name: "Profile", icon: <UserCircle size={20} />, path: "/student/profile" },
  ];

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* App Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <h1 className="text-xl font-medium">CampusConnect</h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <span className="text-sm">{currentUser?.email}</span>
          <button 
            className="p-1 rounded-full hover:bg-white/10"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white shadow-md flex justify-around">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a className={`flex flex-col items-center py-3 px-6 ${location === item.path ? 'text-primary' : 'text-neutral-400'}`}>
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
