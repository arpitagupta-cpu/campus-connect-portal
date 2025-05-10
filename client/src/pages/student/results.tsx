import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Result } from "@shared/schema";
import { Medal, TrendingUp, Calendar, User, FileText, XCircle } from "lucide-react";

export default function StudentResults() {
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch results
  const { 
    data: results, 
    isLoading: resultsLoading 
  } = useQuery<Result[]>({
    queryKey: ['/api/results'],
  });

  const openDetailsModal = (result: Result) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 75) return "text-blue-600 bg-blue-100";
    if (percentage >= 60) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "Excellent";
    if (percentage >= 75) return "Good";
    if (percentage >= 60) return "Satisfactory";
    return "Needs Improvement";
  };

  return (
    <StudentLayout title="Results">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-neutral-800 mb-3">Your Academic Results</h2>
        
        {resultsLoading ? (
          <>
            <Skeleton className="h-28 w-full mb-4" />
            <Skeleton className="h-28 w-full mb-4" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : results && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetailsModal(result)}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-neutral-800">{result.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getScoreColor(result.score, result.maxScore)}`}>
                      {getScoreLabel(result.score, result.maxScore)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{result.description || 'No description available'}</p>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Score</span>
                      <span className="font-medium">{result.score}/{result.maxScore}</span>
                    </div>
                    <Progress value={(result.score / result.maxScore) * 100} className="h-2" />
                  </div>
                  
                  <div className="flex items-center mt-3 text-xs text-neutral-500">
                    <span className="flex items-center mr-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(result.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <XCircle className="mx-auto h-12 w-12 text-neutral-300" />
            <h3 className="mt-2 text-lg font-medium text-neutral-800">No Results Available</h3>
            <p className="text-neutral-500">Your results will appear here once they are published.</p>
          </div>
        )}
      </div>

      {/* Overall Performance Card */}
      {results && results.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Overall Performance</h2>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-2">
                  <Medal className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-neutral-600">Average Score</p>
                <p className="font-bold text-lg">
                  {results.reduce((acc, result) => acc + ((result.score / result.maxScore) * 100), 0) / results.length}%
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-neutral-600">Total Results</p>
                <p className="font-bold text-lg">{results.length}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-amber-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-2">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
                <p className="text-sm text-neutral-600">Rank</p>
                <p className="font-bold text-lg">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedResult?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedResult && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-neutral-500">Score</p>
                  <p className="text-2xl font-bold">
                    {selectedResult.score}/{selectedResult.maxScore}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Percentage</p>
                  <p className="text-2xl font-bold">
                    {((selectedResult.score / selectedResult.maxScore) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <Progress 
                value={(selectedResult.score / selectedResult.maxScore) * 100} 
                className="h-2 mb-6"
              />
              
              {selectedResult.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Details</h4>
                  <p className="text-sm text-neutral-600">{selectedResult.description}</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
