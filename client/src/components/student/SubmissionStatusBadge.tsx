import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, HelpCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionStatusBadgeProps {
  status: "submitted" | "pending" | "late" | "missing" | "graded" | null | undefined;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  grade?: number | null;
}

/**
 * Component to display assignment submission status as a colored badge with optional icon
 */
export default function SubmissionStatusBadge({
  status,
  className,
  showIcon = true,
  size = "md",
  grade
}: SubmissionStatusBadgeProps) {
  // Determine badge styles based on status
  const getBadgeContent = () => {
    switch (status) {
      case "submitted":
        return {
          label: "Submitted",
          variant: "success",
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          color: "text-green-500 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
        };
      case "graded":
        return {
          label: grade ? `Graded: ${grade}%` : "Graded",
          variant: "success", 
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          color: "text-purple-500 dark:text-purple-400",
          bg: "bg-purple-50 dark:bg-purple-900/20",
          border: "border-purple-200 dark:border-purple-800",
        };
      case "pending":
        return {
          label: "Pending",
          variant: "warning",
          icon: <Clock className="h-3.5 w-3.5" />,
          color: "text-yellow-500 dark:text-yellow-400",
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
        };
      case "late":
        return {
          label: "Late",
          variant: "danger",
          icon: <Clock className="h-3.5 w-3.5" />,
          color: "text-amber-500 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
        };
      case "missing":
        return {
          label: "Missing",
          variant: "destructive",
          icon: <XCircle className="h-3.5 w-3.5" />,
          color: "text-red-500 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          label: "Unknown",
          variant: "default",
          icon: <HelpCircle className="h-3.5 w-3.5" />,
          color: "text-gray-500 dark:text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const content = getBadgeContent();
  
  // Size variations
  const sizeClasses = {
    sm: "text-xs py-0.5 px-2",
    md: "text-xs py-1 px-2.5",
    lg: "text-sm py-1 px-3",
  };
  
  const badgeClass = cn(
    "border rounded-full font-medium flex items-center gap-1",
    content.bg,
    content.color,
    content.border,
    sizeClasses[size],
    className
  );

  return (
    <div className={badgeClass}>
      {showIcon && content.icon}
      {content.label}
    </div>
  );
}