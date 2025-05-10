import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Assignment, Submission } from "@shared/schema";
import FileUpload from "@/components/ui/file-upload";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, User, Check, FileText, Upload, XCircle } from "lucide-react";

export default function StudentAssignments() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  } | null>(null);
  
  const { toast } = useToast();

  // Fetch active assignments
  const { 
    data: activeAssignments, 
    isLoading: activeAssignmentsLoading 
  } = useQuery<(Assignment & { hasSubmitted?: boolean })[]>({
    queryKey: ['/api/assignments/active'],
  });

  // Fetch past assignments with submissions
  const { 
    data: pastAssignments, 
    isLoading: pastAssignmentsLoading 
  } = useQuery<(Assignment & { submission?: Submission })[]>({
    queryKey: ['/api/assignments/completed'],
  });

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !uploadedFileInfo) return;
    
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/submissions", {
        assignmentId: selectedAssignment.id,
        fileUrl: uploadedFileInfo.fileUrl,
      });
      
      toast({
        title: "Assignment submitted",
        description: "Your assignment has been submitted successfully.",
      });
      
      setIsSubmitModalOpen(false);
      setSelectedAssignment(null);
      setUploadedFileInfo(null);
      
      // Invalidate assignments queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was an error submitting your assignment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = (fileUrl: string, fileName: string, fileSize: number, fileType: string) => {
    setUploadedFileInfo({
      fileUrl,
      fileName,
      fileSize,
      fileType
    });
  };

  const openSubmitModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitModalOpen(true);
  };

  const openInstructionsModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsInstructionsModalOpen(true);
  };

  const closeModals = () => {
    setIsSubmitModalOpen(false);
    setIsInstructionsModalOpen(false);
    setSelectedAssignment(null);
    setUploadedFileInfo(null);
  };
  
  const formatDueDate = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const getDaysRemaining = (dateValue: string | Date) => {
    const dueDate = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDueDateLabel = (dateValue: string | Date) => {
    const days = getDaysRemaining(dateValue);
    
    if (days <= 0) {
      return <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded-full">Overdue</span>;
    } else if (days <= 2) {
      return <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded-full">Due in {days} day{days !== 1 ? 's' : ''}</span>;
    } else if (days <= 5) {
      return <span className="text-xs font-medium bg-amber-100 text-amber-600 px-2 py-1 rounded-full">Due in {days} days</span>;
    } else {
      return <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">Due in {days} days</span>;
    }
  };

  return (
    <StudentLayout title="Assignments">
      {/* Active Assignments */}
      <h2 className="text-lg font-medium text-neutral-800 mb-3">Due Assignments</h2>
      
      {activeAssignmentsLoading ? (
        <div className="space-y-4 mb-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : activeAssignments && activeAssignments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {activeAssignments.map((assignment) => (
            <Card 
              key={assignment.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openInstructionsModal(assignment)}
            >
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-neutral-800">{assignment.title}</h3>
                  <div className="flex items-center space-x-2">
                    {assignment.hasSubmitted ? (
                      <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        Submitted
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                    {getDueDateLabel(assignment.dueDate)}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mt-1">{assignment.description}</p>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                    <span>Progress</span>
                    <span>{assignment.hasSubmitted ? '100%' : '0%'}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all duration-500"
                      style={{ width: assignment.hasSubmitted ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center mt-3 text-xs text-neutral-500">
                  <span className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDueDate(assignment.dueDate)}
                  </span>
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Admin
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t border-neutral-100 px-4 py-2 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary text-sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    openInstructionsModal(assignment);
                  }}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Instructions
                </Button>
                <Button 
                  size="sm" 
                  className="bg-primary text-white" 
                  onClick={(e) => {
                    e.stopPropagation();
                    openSubmitModal(assignment);
                  }}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {assignment.hasSubmitted ? 'Resubmit' : 'Submit'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-6">
          <XCircle className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-2 text-lg font-medium text-neutral-800">No Assignments Due</h3>
          <p className="text-neutral-500">You don't have any assignments due right now.</p>
        </div>
      )}

      {/* Past Assignments */}
      <h2 className="text-lg font-medium text-neutral-800 mb-3">Completed Assignments</h2>
      
      {pastAssignmentsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : pastAssignments && pastAssignments.length > 0 ? (
        <div className="space-y-4">
          {pastAssignments.map((assignment) => (
            <Card key={assignment.id} className="overflow-hidden opacity-75">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-neutral-800">{assignment.title}</h3>
                  <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">Submitted</span>
                </div>
                <p className="text-sm text-neutral-600 mt-1">{assignment.description}</p>
                
                <div className="flex items-center mt-3 text-xs text-neutral-500">
                  <span className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDueDate(assignment.dueDate)}
                  </span>
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Admin
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t border-neutral-100 px-4 py-2 flex justify-between">
                {assignment.submission?.grade ? (
                  <span className="text-green-600 text-sm flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Grade: {assignment.submission.grade}/100
                  </span>
                ) : (
                  <span className="text-neutral-500 text-sm flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Awaiting grade
                  </span>
                )}
                {assignment.submission?.feedback && (
                  <Button variant="ghost" size="sm" className="text-primary text-sm">
                    View Feedback
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <XCircle className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-2 text-lg font-medium text-neutral-800">No Completed Assignments</h3>
          <p className="text-neutral-500">You haven't submitted any assignments yet.</p>
        </div>
      )}

      {/* Instructions Modal */}
      <Dialog open={isInstructionsModalOpen} onOpenChange={setIsInstructionsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              Due on {selectedAssignment && formatDueDate(selectedAssignment.dueDate)}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            {/* Assignment status */}
            <div className="mb-4">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  {selectedAssignment?.hasSubmitted ? (
                    <span className="text-sm font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      Submitted
                    </span>
                  ) : (
                    <span className="text-sm font-medium bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <div>
                  {selectedAssignment && getDueDateLabel(selectedAssignment.dueDate)}
                </div>
              </div>
              
              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                  <span>Assignment Progress</span>
                  <span>{selectedAssignment?.hasSubmitted ? '100%' : '0%'}</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-primary rounded-full h-2.5 transition-all duration-500"
                    style={{ width: selectedAssignment?.hasSubmitted ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Instructions:</h4>
            <p className="text-sm text-neutral-600 mb-4 whitespace-pre-line">{selectedAssignment?.description}</p>
            
            {/* Upload section */}
            {!selectedAssignment?.hasSubmitted ? (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-3">Upload your assignment</h4>
                <FileUpload 
                  onUploadComplete={handleUploadComplete}
                  acceptedFileTypes=".pdf,.doc,.docx,.zip"
                  maxFileSizeMB={10}
                  defaultInstructions="Drop your assignment file here or click to browse"
                />
                
                {uploadedFileInfo && (
                  <div className="mt-4 p-3 bg-neutral-50 rounded-md">
                    <p className="text-sm font-medium">File ready to submit:</p>
                    <p className="text-xs text-neutral-500">{uploadedFileInfo.fileName} ({Math.round(uploadedFileInfo.fileSize/1024)} KB)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">Your submission</h4>
                <div className="bg-neutral-50 p-3 rounded-md">
                  <p className="text-sm">You have already submitted this assignment.</p>
                  <p className="text-xs text-neutral-500 mt-1">If you need to make changes, you can upload a new file.</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" className="mr-2">
                <FileText className="h-4 w-4 mr-1" />
                Download Instructions
              </Button>
              {uploadedFileInfo ? (
                <Button size="sm" onClick={handleSubmitAssignment} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => {
                    setIsInstructionsModalOpen(false);
                    setIsSubmitModalOpen(true);
                  }}
                  disabled={!selectedAssignment}
                >
                  {selectedAssignment?.hasSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Assignment Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-neutral-600 mb-4">
              Upload your completed assignment file below.
            </p>
            
            <FileUpload 
              onUploadComplete={handleUploadComplete}
              acceptedFileTypes=".pdf,.doc,.docx,.zip"
              maxFileSizeMB={10}
            />
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={closeModals} disabled={isSubmitting}>Cancel</Button>
              <Button 
                onClick={handleSubmitAssignment} 
                disabled={!uploadedFileInfo || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
