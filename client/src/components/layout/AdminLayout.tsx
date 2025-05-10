import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Award,
  BookOpen,
  Bell,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  MessageCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { currentUser, signOut } = useAuth();
  const [location] = useLocation();

  const mainNavItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
    { name: "Assignments", icon: <FileText size={20} />, path: "/admin/assignments" },
    { name: "Results", icon: <Award size={20} />, path: "/admin/results" },
    { name: "Study Materials", icon: <BookOpen size={20} />, path: "/admin/materials" },
    { name: "Announcements", icon: <Bell size={20} />, path: "/admin/announcements" },
    { name: "Student Chat", icon: <MessageCircle size={20} />, path: "/admin/chat" },
  ];

  const adminNavItems = [
    { name: "Students", icon: <Users size={20} />, path: "/admin/students" },
    { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
  ];

  const handleLogout = () => {
    signOut();
  };

  // Get the initials of the user's email
  const getInitials = () => {
    if (!currentUser?.email) return "A";
    return currentUser.email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen flex">
      {/* Side Navigation */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4">
          <h1 className="text-xl font-medium">CampusConnect</h1>
          <p className="text-sm opacity-80">Admin Portal</p>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Management</p>
            <ul>
              {mainNavItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a className={`flex items-center py-2 px-3 rounded-lg ${
                      location === item.path 
                        ? 'text-primary bg-primary/10' 
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}>
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-6 mb-2">Administration</p>
            <ul>
              {adminNavItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a className={`flex items-center py-2 px-3 rounded-lg ${
                      location === item.path 
                        ? 'text-primary bg-primary/10' 
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}>
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-neutral-800">{currentUser?.email}</p>
              <p className="text-xs text-neutral-500">Administrator</p>
            </div>
            <button 
              className="ml-auto p-1 text-neutral-400 hover:text-neutral-700"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-neutral-50">
        {/* App Bar */}
        <div className="bg-white p-4 flex justify-between items-center border-b border-neutral-200">
          <h1 className="text-xl font-medium text-neutral-800">{title}</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/admin/notifications">
              <a className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100">
                <Bell size={20} />
              </a>
            </Link>
            <button className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100">
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
