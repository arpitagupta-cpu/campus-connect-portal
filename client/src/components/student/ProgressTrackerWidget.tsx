import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import ProgressTracker from "@/components/ui/progress-tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Award, BookOpen, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressTrackerWidget() {
  const { currentUser } = useAuth();
  
  // Get assignment completion stats
  const { data: assignmentStats, isLoading: loadingAssignments } = useQuery({
    queryKey: ['/api/student/progress/assignments'],
    enabled: !!currentUser,
  });
  
  // Get material completion stats
  const { data: materialStats, isLoading: loadingMaterials } = useQuery({
    queryKey: ['/api/student/progress/materials'],
    enabled: !!currentUser,
  });
  
  // Get result stats
  const { data: resultStats, isLoading: loadingResults } = useQuery({
    queryKey: ['/api/student/progress/results'],
    enabled: !!currentUser,
  });
  
  // Calculate overall progress
  const { data: overallStats, isLoading: loadingOverall } = useQuery({
    queryKey: ['/api/student/progress/overall'],
    enabled: !!currentUser,
  });
  
  const isLoading = loadingAssignments || loadingMaterials || loadingResults || loadingOverall;
  
  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="overall">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overall" className="space-y-4">
            <ProgressTracker 
              title="Overall Academic Progress" 
              value={overallStats?.percentage || 0}
              description="Your total academic progress across all activities"
              showIcon
              icon={<GraduationCap className="h-4 w-4 text-primary" />}
            />
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <ProgressTracker 
              title="Assignment Completion" 
              value={assignmentStats?.percentage || 0}
              description={`${assignmentStats?.completed || 0} of ${assignmentStats?.total || 0} assignments completed`}
              showIcon
              icon={<FileText className="h-4 w-4 text-primary" />}
            />
            
            {assignmentStats?.onTimePercentage !== undefined && (
              <ProgressTracker 
                title="On-time Submissions" 
                value={assignmentStats.onTimePercentage}
                description="Percentage of assignments submitted on time"
                color={assignmentStats.onTimePercentage > 80 ? "success" : assignmentStats.onTimePercentage > 50 ? "warning" : "danger"}
              />
            )}
          </TabsContent>
          
          <TabsContent value="materials" className="space-y-4">
            <ProgressTracker 
              title="Study Materials Reviewed" 
              value={materialStats?.percentage || 0}
              description={`${materialStats?.reviewed || 0} of ${materialStats?.total || 0} materials reviewed`}
              showIcon
              icon={<BookOpen className="h-4 w-4 text-primary" />}
            />
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            <ProgressTracker 
              title="Assessment Performance" 
              value={resultStats?.averageScore || 0}
              description={`Average score across ${resultStats?.total || 0} assessments`}
              showIcon
              icon={<Award className="h-4 w-4 text-primary" />}
            />
            
            {resultStats?.passRate !== undefined && (
              <ProgressTracker 
                title="Pass Rate" 
                value={resultStats.passRate}
                description="Percentage of assessments with passing grades"
                color={resultStats.passRate > 80 ? "success" : resultStats.passRate > 60 ? "warning" : "danger"}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}