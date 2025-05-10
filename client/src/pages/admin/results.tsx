import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import UploadResultModal from "@/components/admin/UploadResultModal";
import { Result } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  User,
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  Edit,
  Trash
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function AdminResults() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();

  // Fetch results
  const { 
    data: results, 
    isLoading 
  } = useQuery<Result[]>({
    queryKey: ['/api/admin/results'],
  });

  const filteredResults = results?.filter(result => {
    return result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (result.description && result.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const viewResultDetails = (result: Result) => {
    setSelectedResult(result);
    setIsDetailsModalOpen(true);
  };

  const deleteResult = async () => {
    if (!selectedResult) return;
    
    try {
      await apiRequest("DELETE", `/api/results/${selectedResult.id}`, undefined);
      
      toast({
        title: "Result Deleted",
        description: "The result has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/results'] });
      setIsDeleteConfirmOpen(false);
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error deleting result:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the result.",
      });
    }
  };

  return (
    <AdminLayout title="Student Results">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search results..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Button className="w-full sm:w-auto" onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Result
        </Button>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filteredResults && filteredResults.length > 0 ? (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewResultDetails(result)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 rounded flex-shrink-0">
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-neutral-800">{result.title}</h3>
                        <div className="flex items-center">
                          <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            {result.score}/{result.maxScore} Points
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{result.description || 'No description provided'}</p>
                      
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
                          <span>Score</span>
                          <span>{((result.score / result.maxScore) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(result.score / result.maxScore) * 100} className="h-1.5" />
                      </div>
                      
                      <div className="flex items-center mt-3 text-xs text-neutral-500">
                        <span className="flex items-center mr-4">
                          <User className="h-4 w-4 mr-1" />
                          Student ID: {result.studentId}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-neutral-300" />
          <h3 className="mt-2 text-lg font-medium text-neutral-800">No Results Found</h3>
          <p className="text-neutral-500">
            {searchQuery 
              ? "No results match your search criteria."
              : "You haven't uploaded any student results yet."}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Result
            </Button>
          )}
        </div>
      )}

      {/* Upload Result Modal */}
      <UploadResultModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

      {/* Result Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedResult?.title}</DialogTitle>
            <DialogDescription>
              Student Result Details
            </DialogDescription>
          </DialogHeader>
          
          {selectedResult && (
            <div className="mt-4">
              <div className="mb-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-neutral-500" />
                  <h4 className="text-sm font-medium text-neutral-700">Student Information</h4>
                </div>
                <p className="text-sm text-neutral-600 mt-1 pl-7">
                  Student ID: {selectedResult.studentId}
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-500" />
                  <h4 className="text-sm font-medium text-neutral-700">Score Details</h4>
                </div>
                <div className="mt-2 pl-7">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-neutral-500">Score</p>
                      <p className="text-xl font-bold">
                        {selectedResult.score}/{selectedResult.maxScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Percentage</p>
                      <p className="text-xl font-bold">
                        {((selectedResult.score / selectedResult.maxScore) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(selectedResult.score / selectedResult.maxScore) * 100} 
                    className="h-2 mb-4"
                  />
                </div>
              </div>
              
              {selectedResult.description && (
                <div className="mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-neutral-500" />
                    <h4 className="text-sm font-medium text-neutral-700">Description</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1 pl-7">{selectedResult.description}</p>
                </div>
              )}
              
              <div className="pt-2 border-t border-neutral-200">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Published on</span>
                  <span>
                    {new Date(selectedResult.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Result
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteConfirmOpen(true)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <Button onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this result? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteResult}>Delete Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
