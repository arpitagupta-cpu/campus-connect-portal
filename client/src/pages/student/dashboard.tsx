import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Announcement, Assignment, Material } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { 
  FileText, 
  Award, 
  BookOpen, 
  Calendar, 
  User, 
  Download 
} from "lucide-react";

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const firstName = currentUser?.email?.split('@')[0] || "Student";

  // Fetch announcements
  const { 
    data: announcements, 
    isLoading: announcementsLoading 
  } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements'],
  });

  // Fetch pending assignments count
  const { 
    data: assignmentData,
    isLoading: assignmentsLoading
  } = useQuery<{ pendingCount: number }>({
    queryKey: ['/api/assignments/pending/count'],
  });

  // Fetch new results count
  const { 
    data: resultsData,
    isLoading: resultsLoading
  } = useQuery<{ newCount: number }>({
    queryKey: ['/api/results/new/count'],
  });

  // Fetch study materials preview
  const { 
    data: materials,
    isLoading: materialsLoading
  } = useQuery<Material[]>({
    queryKey: ['/api/materials/recent'],
  });

  return (
    <StudentLayout title="Dashboard">
      {/* Welcome Message */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <h2 className="text-lg font-medium text-neutral-800">Welcome back, {firstName}!</h2>
          <p className="text-neutral-600">Here's what's new at your campus today.</p>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Assignments Card */}
        <Card className="relative overflow-hidden border-l-4 border-primary">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <FileText className="h-5 w-5 text-primary" />
              {assignmentsLoading ? (
                <Skeleton className="h-5 w-12 rounded-full" />
              ) : (
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {assignmentData?.pendingCount || 0} New
                </span>
              )}
            </div>
            <h3 className="mt-2 text-neutral-800 font-medium">Assignments</h3>
            <p className="text-sm text-neutral-600">Pending tasks and submissions</p>
          </CardContent>
        </Card>
        
        {/* Results Card */}
        <Card className="relative overflow-hidden border-l-4 border-amber-500">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <Award className="h-5 w-5 text-amber-500" />
              {resultsLoading ? (
                <Skeleton className="h-5 w-12 rounded-full" />
              ) : (
                <span className="text-xs font-medium bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
                  {resultsData?.newCount || 0} New
                </span>
              )}
            </div>
            <h3 className="mt-2 text-neutral-800 font-medium">Results</h3>
            <p className="text-sm text-neutral-600">Your academic performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Section */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-neutral-800">Recent Announcements</h2>
            <Link href="/student/announcements">
              <a className="text-sm text-primary cursor-pointer">View All</a>
            </Link>
          </div>

          {announcementsLoading ? (
            <>
              <Skeleton className="h-16 w-full mb-3" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : announcements && announcements.length > 0 ? (
            announcements.slice(0, 2).map((announcement) => (
              <div key={announcement.id} className="border-b border-neutral-100 pb-3 mb-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-neutral-800">{announcement.title}</h3>
                  <span className="text-xs text-neutral-500">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mt-1">{announcement.content}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-sm">No recent announcements.</p>
          )}
        </CardContent>
      </Card>

      {/* Study Materials Preview */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-neutral-800">Study Materials</h2>
            <Link href="/student/materials">
              <a className="text-sm text-primary cursor-pointer">View All</a>
            </Link>
          </div>

          {materialsLoading ? (
            <>
              <Skeleton className="h-16 w-full mb-3" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : materials && materials.length > 0 ? (
            <div className="space-y-3">
              {materials.slice(0, 2).map((material) => (
                <div key={material.id} className="flex items-center p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50">
                  <div className="mr-3 p-2 bg-primary/10 rounded">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-800">{material.title}</h3>
                    <p className="text-xs text-neutral-500">
                      {material.fileType} • {(material.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <Link href={material.fileUrl}>
                    <a className="p-1 text-primary hover:bg-primary/10 rounded">
                      <Download className="h-5 w-5" />
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">No study materials available.</p>
          )}
        </CardContent>
      </Card>
    </StudentLayout>
  );
}
