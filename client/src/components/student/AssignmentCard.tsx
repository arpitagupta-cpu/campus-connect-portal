import { Assignment } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, Upload } from "lucide-react";

interface AssignmentCardProps {
  assignment: Assignment;
  onViewInstructions?: () => void;
  onSubmit?: () => void;
  isPast?: boolean;
  grade?: number | null;
  hasSubmitted?: boolean;
}

export default function AssignmentCard({ 
  assignment, 
  onViewInstructions, 
  onSubmit, 
  isPast = false,
  grade = null,
  hasSubmitted = false
}: AssignmentCardProps) {
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const getDaysRemaining = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDueDateLabel = (dateString: string) => {
    if (isPast) {
      return <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-1 rounded-full">Submitted</span>;
    }
    
    const days = getDaysRemaining(dateString);
    
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
    <Card className={`overflow-hidden ${isPast ? 'opacity-75' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-neutral-800">{assignment.title}</h3>
          {getDueDateLabel(assignment.dueDate)}
        </div>
        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{assignment.description}</p>
        
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
        {isPast ? (
          <>
            {grade !== null ? (
              <span className="text-green-600 text-sm flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Grade: {grade}/100
              </span>
            ) : (
              <span className="text-neutral-500 text-sm flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Awaiting grade
              </span>
            )}
            <Button variant="ghost" size="sm" className="text-primary text-sm">
              View Feedback
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary text-sm"
              onClick={onViewInstructions}
            >
              <FileText className="h-4 w-4 mr-1" />
              View Instructions
            </Button>
            <Button 
              size="sm" 
              className="bg-primary text-white"
              onClick={onSubmit}
              disabled={hasSubmitted}
            >
              <Upload className="h-4 w-4 mr-1" />
              {hasSubmitted ? 'Resubmit' : 'Submit'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
