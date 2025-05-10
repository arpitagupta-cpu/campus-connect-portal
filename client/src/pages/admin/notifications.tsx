import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Bell, FileText, Award, BookOpen, MessageCircle, Info } from "lucide-react";

// Define notification types
interface Notification {
  id: number;
  type: "announcement" | "assignment" | "result" | "material" | "chat" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  itemId?: number;
}

export default function AdminNotifications() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/admin/notifications'],
    enabled: !!currentUser,
    staleTime: 60000, // 1 minute
  });
  
  // Mark notifications as read when viewed
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const unreadNotifications = notifications.filter(notification => !notification.isRead);
      
      if (unreadNotifications.length > 0) {
        // Mark as read via API
        fetch('/api/admin/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationIds: unreadNotifications.map(notification => notification.id),
          }),
        });
      }
    }
  }, [notifications]);
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications?.filter(notification => {
    if (activeTab === "all") return true;
    return notification.type === activeTab;
  });
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Bell className="h-5 w-5 text-blue-500" />;
      case "assignment":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "result":
        return <Award className="h-5 w-5 text-purple-500" />;
      case "material":
        return <BookOpen className="h-5 w-5 text-amber-500" />;
      case "chat":
        return <MessageCircle className="h-5 w-5 text-rose-500" />;
      case "system":
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get notification badge color based on type
  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "announcement":
        return <Badge variant="secondary">Announcement</Badge>;
      case "assignment":
        return <Badge variant="success">Assignment</Badge>;
      case "result":
        return <Badge variant="warning">Result</Badge>;
      case "material":
        return <Badge variant="outline">Study Material</Badge>;
      case "chat":
        return <Badge variant="destructive">Message</Badge>;
      case "system":
      default:
        return <Badge variant="default">System</Badge>;
    }
  };
  
  // Handle notification click to navigate to relevant page
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      window.location.href = notification.link;
    }
  };
  
  // Clear all notifications
  const handleClearAll = async () => {
    try {
      await fetch('/api/admin/notifications/clear-all', {
        method: 'DELETE',
      });
      refetch();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };
  
  return (
    <AdminLayout title="Notifications">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Monitor system updates and student activities
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearAll}
              disabled={!notifications || notifications.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="announcement">Announcements</TabsTrigger>
                <TabsTrigger value="assignment">Assignments</TabsTrigger>
                <TabsTrigger value="result">Results</TabsTrigger>
                <TabsTrigger value="material">Materials</TabsTrigger>
                <TabsTrigger value="chat">Messages</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : filteredNotifications && filteredNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg transition-colors duration-200 ${
                          notification.isRead ? 'bg-white' : 'bg-blue-50'
                        } ${notification.link ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                {getNotificationBadge(notification.type)}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-gray-600">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No notifications</h3>
                    <p className="text-gray-500">
                      {activeTab === "all"
                        ? "You don't have any notifications at the moment"
                        : `You don't have any ${activeTab} notifications`}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}