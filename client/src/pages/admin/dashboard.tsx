import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UploadAssignmentModal from "@/components/admin/UploadAssignmentModal";
import UploadMaterialModal from "@/components/admin/UploadMaterialModal";
import PostAnnouncementModal from "@/components/admin/PostAnnouncementModal";
import UploadResultModal from "@/components/admin/UploadResultModal";
import { useState } from "react";
import { 
  Users, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Bell, 
  Upload, 
  CheckSquare, 
  FileUp 
} from "lucide-react";

interface DashboardStats {
  activeStudents: number;
  pendingAssignments: number;
  studyMaterials: number;
}

interface ActivityItem {
  id: number;
  type: "assignment" | "announcement" | "result";
  title: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Fetch dashboard stats
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch recent activity
  const { 
    data: activities, 
    isLoading: activitiesLoading 
  } = useQuery<ActivityItem[]>({
    queryKey: ['/api/admin/activities'],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <FileText className="h-4 w-4 text-primary" />;
      case "announcement":
        return <Bell className="h-4 w-4 text-green-600" />;
      case "result":
        return <CheckSquare className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-neutral-600 font-medium">Active Students</h2>
              <Users className="h-5 w-5 text-primary" />
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-3xl font-medium text-neutral-800">{stats?.activeStudents || 0}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last semester
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-neutral-600 font-medium">Pending Assignments</h2>
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-3xl font-medium text-neutral-800">{stats?.pendingAssignments || 0}</p>
                <p className="text-sm text-neutral-500 mt-1">Across all courses</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-neutral-600 font-medium">Study Materials</h2>
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-3xl font-medium text-neutral-800">{stats?.studyMaterials || 0}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <FileUp className="h-4 w-4 mr-1" />
                  5 new this week
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-800">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          {activitiesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-800">
                      You {activity.type === "assignment" ? "uploaded a new assignment" :
                         activity.type === "announcement" ? "posted an announcement" :
                         "updated grades for"} <span className="font-medium">{activity.title}</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 py-4 text-center">No recent activity to display.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-4">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="border border-neutral-200 rounded-lg p-4 text-left justify-start h-auto"
              onClick={() => setIsAssignmentModalOpen(true)}
            >
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Create Assignment</h3>
                <p className="text-sm text-neutral-600">Upload a new task for students</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="border border-neutral-200 rounded-lg p-4 text-left justify-start h-auto"
              onClick={() => setIsAnnouncementModalOpen(true)}
            >
              <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center mr-3">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Post Announcement</h3>
                <p className="text-sm text-neutral-600">Share updates with students</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="border border-neutral-200 rounded-lg p-4 text-left justify-start h-auto"
              onClick={() => setIsMaterialModalOpen(true)}
            >
              <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center mr-3">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Upload Study Material</h3>
                <p className="text-sm text-neutral-600">Share resources with students</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="border border-neutral-200 rounded-lg p-4 text-left justify-start h-auto"
              onClick={() => setIsResultModalOpen(true)}
            >
              <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center mr-3">
                <CheckSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Upload Results</h3>
                <p className="text-sm text-neutral-600">Publish student results</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <UploadAssignmentModal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} />
      <PostAnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} />
      <UploadMaterialModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} />
      <UploadResultModal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} />
    </AdminLayout>
  );
}
