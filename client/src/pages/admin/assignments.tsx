import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import UploadAssignmentModal from "@/components/admin/UploadAssignmentModal";
import { Assignment, Submission } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  Download, 
  Plus, 
  CheckCircle,
  ClipboardList,
  XCircle,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AdminAssignments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("active");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch assignments
  const { 
    data: assignments, 
    isLoading: assignmentsLoading 
  } = useQuery<Assignment[]>({
    queryKey: ['/api/admin/assignments'],
  });

  const filteredAssignments = assignments?.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isActive = dueDate > now;
    
    const matchesTab = (selectedTab === "active" && isActive) || 
                      (selectedTab === "past" && !isActive);
    
    return matchesSearch && matchesTab;
  });

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDueStatus = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded-full">Expired</span>;
    } else if (diffDays <= 2) {
      return <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded-full">Due in {diffDays} day{diffDays !== 1 ? 's' : ''}</span>;
    } else if (diffDays <= 5) {
      return <span className="text-xs font-medium bg-amber-100 text-amber-600 px-2 py-1 rounded-full">Due in {diffDays} days</span>;
    } else {
      return <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">Due in {diffDays} days</span>;
    }
  };

  const viewAssignmentDetails = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailsModalOpen(true);
    
    try {
      setIsSubmissionsLoading(true);
      const response = await apiRequest("GET", `/api/assignments/${assignment.id}/submissions`, undefined);
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load assignment submissions.",
      });
      setSubmissions([]);
    } finally {
      setIsSubmissionsLoading(false);
    }
  };

  const deleteAssignment = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/assignments/${id}`, undefined);
      
      toast({
        title: "Assignment Deleted",
        description: "The assignment has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/assignments'] });
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the assignment.",
      });
    }
  };

  return (
    <AdminLayout title="Assignments">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search assignments..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Button className="w-full sm:w-auto" onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="active">Active Assignments</TabsTrigger>
          <TabsTrigger value="past">Past Assignments</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Assignments List */}
      {assignmentsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filteredAssignments && filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-neutral-800">{assignment.title}</h3>
                        {getDueStatus(assignment.dueDate)}
                      </div>
                      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{assignment.description}</p>
                      
                      <div className="flex items-center mt-3 text-xs text-neutral-500">
                        <span className="flex items-center mr-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {formatDueDate(assignment.dueDate)}
                        </span>
                        <span className="flex items-center mr-4">
                          <User className="h-4 w-4 mr-1" />
                          Target: {assignment.targetGroup === 'all' ? 'All Students' : assignment.targetGroup}
                        </span>
                        <span className="flex items-center">
                          <ClipboardList className="h-4 w-4 mr-1" />
                          0 Submissions
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-4">
                    <Button variant="ghost" size="sm" onClick={() => viewAssignmentDetails(assignment)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-2 text-lg font-medium text-neutral-800">No Assignments Found</h3>
          <p className="text-neutral-500">
            {searchQuery 
              ? "No assignments match your search criteria." 
              : selectedTab === "active" 
                ? "You don't have any active assignments." 
                : "You don't have any past assignments."}
          </p>
          {!searchQuery && selectedTab === "active" && (
            <Button className="mt-4" onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>
      )}

      {/* Create Assignment Modal */}
      <UploadAssignmentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

      {/* Assignment Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              Assignment Details and Submissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Description</h4>
                  <p className="text-sm text-neutral-600">{selectedAssignment.description}</p>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-700 mb-1">Due Date</h4>
                    <p className="text-sm text-neutral-600">{formatDueDate(selectedAssignment.dueDate)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Target Group</h4>
                  <p className="text-sm text-neutral-600">{selectedAssignment.targetGroup === 'all' ? 'All Students' : selectedAssignment.targetGroup}</p>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-700 mb-1">Assignment File</h4>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm text-neutral-600 truncate">Assignment Materials</span>
                      <Button variant="ghost" size="sm" className="ml-2" asChild>
                        <a href={selectedAssignment.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-neutral-200 pt-6 mt-2">
                <h3 className="text-lg font-medium mb-4">Student Submissions</h3>
                
                {isSubmissionsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map((submission) => (
                      <Card key={submission.id}>
                        <CardContent className="p-3 flex items-center">
                          <div className="mr-3 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-neutral-800">Student ID: {submission.studentId}</p>
                            <p className="text-xs text-neutral-500">
                              Submitted on {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                            {submission.grade ? (
                              <span className="text-green-600 text-sm flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Graded: {submission.grade}/100
                              </span>
                            ) : (
                              <Button variant="outline" size="sm">
                                Grade Submission
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <XCircle className="mx-auto h-8 w-8 text-neutral-300" />
                    <p className="mt-2 text-neutral-500">No submissions yet</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="destructive" onClick={() => deleteAssignment(selectedAssignment.id)}>
                  Delete Assignment
                </Button>
                <Button onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
